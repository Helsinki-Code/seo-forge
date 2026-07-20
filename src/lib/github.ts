import { Octokit } from "octokit";
import { decryptSecret } from "./crypto";
import type { Site } from "./data";

/** Per-site GitHub access: the user's own repo + their own (encrypted) token. */
export function siteRepoOf(site: Site): { owner: string; repo: string } {
  const full = site.github_repo || process.env.GITHUB_REPO || "";
  const [owner, repo] = full.split("/");
  if (!owner || !repo) throw new Error("Site has no GitHub repository configured");
  return { owner, repo };
}

export function siteTokenOf(site: Site): string {
  if (site.repo_token_enc) return decryptSecret(site.repo_token_enc);
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN; // platform-site fallback
  throw new Error("Site has no GitHub token configured");
}

function octoFor(site: Site): Octokit {
  return new Octokit({ auth: siteTokenOf(site) });
}

export async function listOpenPRs(site: Site) {
  const { owner, repo } = siteRepoOf(site);
  const res = await octoFor(site).rest.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 30,
  });
  return res.data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? "unknown",
    branch: pr.head.ref,
    url: pr.html_url,
    createdAt: pr.created_at,
  }));
}

export async function mergePR(site: Site, prNumber: number) {
  const { owner, repo } = siteRepoOf(site);
  return octoFor(site).rest.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    merge_method: "squash",
  });
}

export async function closePR(site: Site, prNumber: number) {
  const { owner, repo } = siteRepoOf(site);
  return octoFor(site).rest.pulls.update({
    owner,
    repo,
    pull_number: prNumber,
    state: "closed",
  });
}

/**
 * Opens a real PR using the SITE OWNER'S OWN token (`siteTokenOf`), never
 * the agent's own GitHub MCP connector. The Site Experience Engineer's MCP
 * connector is authenticated by a single shared vault credential configured
 * once at the platform level — it cannot be scoped per customer, so it can
 * never safely have write access to an arbitrary customer's repo. The agent
 * only ever reports the diff (as an `ImplementationProposal` artifact); the
 * app performs the actual branch/commit/PR using the credential that's
 * already correctly per-site, the same mechanism `mergePR`/`syncAgentBranches`
 * above already use.
 */
export async function openProposalPR(
  site: Site,
  opts: {
    branchName: string;
    title: string;
    body: string;
    files: { path: string; newContent: string }[];
  },
): Promise<{ prNumber: number; url: string; branch: string }> {
  const { owner, repo } = siteRepoOf(site);
  const gh = octoFor(site);

  const repoInfo = await gh.rest.repos.get({ owner, repo });
  const base = repoInfo.data.default_branch;
  const baseRef = await gh.rest.git.getRef({ owner, repo, ref: `heads/${base}` });
  const baseSha = baseRef.data.object.sha;

  await gh.rest.git.createRef({ owner, repo, ref: `refs/heads/${opts.branchName}`, sha: baseSha });

  for (const file of opts.files) {
    let existingSha: string | undefined;
    try {
      const existing = await gh.rest.repos.getContent({ owner, repo, path: file.path, ref: opts.branchName });
      if (!Array.isArray(existing.data) && existing.data.type === "file") existingSha = existing.data.sha;
    } catch {
      // file doesn't exist yet on this branch — creating, not updating
    }
    await gh.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: file.path,
      message: `${opts.title}\n\n${file.path}`,
      content: Buffer.from(file.newContent, "utf8").toString("base64"),
      branch: opts.branchName,
      sha: existingSha,
    });
  }

  const pr = await gh.rest.pulls.create({
    owner,
    repo,
    head: opts.branchName,
    base,
    title: opts.title,
    body: opts.body,
  });

  return { prNumber: pr.data.number, url: pr.data.html_url, branch: opts.branchName };
}

/**
 * The agent → PR bridge. The Site Experience Engineer pushes `seo-agent/*`
 * branches per its own persisted system prompt — it may or may not open the
 * PR itself via its GitHub MCP connector, so this handles both:
 *
 *  - Branch with no open PR yet → the platform opens one (matches the
 *    original design: agent never pushes to main, never merges).
 *  - Branch that already has an open PR (the agent opened it itself) → that
 *    PR is surfaced as-is, not recreated.
 *
 * Either way every proposed change ends up in this return value so the
 * caller can insert it into the Approvals queue. This function has no DB
 * access — callers are responsible for de-duping against already-tracked
 * `approvals.pr_number` rows before inserting, since re-running this scan
 * (webhook retries, the manual "Sync PRs" button) will return the same
 * already-open PR again every time.
 */
export async function syncAgentBranches(
  site: Site,
): Promise<{ branch: string; prNumber: number; title: string; url: string }[]> {
  const { owner, repo } = siteRepoOf(site);
  const gh = octoFor(site);

  const [branches, openPRs, repoInfo] = await Promise.all([
    gh.rest.repos.listBranches({ owner, repo, per_page: 100 }),
    gh.rest.pulls.list({ owner, repo, state: "open", per_page: 100 }),
    gh.rest.repos.get({ owner, repo }),
  ]);

  const base = repoInfo.data.default_branch;
  const agentPRsByBranch = new Map(
    openPRs.data
      .filter((pr) => pr.head.ref.startsWith("seo-agent/"))
      .map((pr) => [pr.head.ref, pr] as const),
  );

  const result: { branch: string; prNumber: number; title: string; url: string }[] = [];

  // Case A: the agent already opened the PR itself — surface it as-is.
  for (const [branch, pr] of agentPRsByBranch) {
    result.push({ branch, prNumber: pr.number, title: pr.title, url: pr.html_url });
  }

  // Case B: the agent pushed a branch but didn't open a PR — open one now.
  const candidates = branches.data
    .map((b) => b.name)
    .filter((name) => name.startsWith("seo-agent/") && !agentPRsByBranch.has(name));

  for (const branch of candidates) {
    const slug = branch.replace(/^seo-agent\//, "").replace(/-/g, " ");
    const title = `SEO: ${slug}`;
    try {
      const pr = await gh.rest.pulls.create({
        owner,
        repo,
        head: branch,
        base,
        title,
        body: [
          "Proposed by the SEO Forge agent team.",
          "",
          "Review the diff, then approve or reject from the SEO Forge Approvals",
          "dashboard (or directly here). Merging deploys via your pipeline.",
          "",
          "🤖 Generated with [Claude Code](https://claude.com/claude-code)",
        ].join("\n"),
      });
      result.push({ branch, prNumber: pr.data.number, title, url: pr.data.html_url });
    } catch {
      // branch may have no diff against base, or a race — skip
    }
  }
  return result;
}
