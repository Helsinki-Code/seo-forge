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
