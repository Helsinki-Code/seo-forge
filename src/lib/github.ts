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
 * The agent → PR bridge. Agents push `seo/*` branches (never PRs, never main);
 * this scans the user's repo for agent branches with no open PR and opens one
 * for each, so every proposed change surfaces in the Approvals queue.
 */
export async function syncAgentBranches(
  site: Site,
): Promise<{ branch: string; prNumber: number; title: string }[]> {
  const { owner, repo } = siteRepoOf(site);
  const gh = octoFor(site);

  const [branches, openPRs, repoInfo] = await Promise.all([
    gh.rest.repos.listBranches({ owner, repo, per_page: 100 }),
    gh.rest.pulls.list({ owner, repo, state: "open", per_page: 100 }),
    gh.rest.repos.get({ owner, repo }),
  ]);

  const base = repoInfo.data.default_branch;
  const withPR = new Set(openPRs.data.map((pr) => pr.head.ref));
  const candidates = branches.data
    .map((b) => b.name)
    .filter((name) => name.startsWith("seo/") && !withPR.has(name));

  const created: { branch: string; prNumber: number; title: string }[] = [];
  for (const branch of candidates) {
    const slug = branch.replace(/^seo\//, "").replace(/-/g, " ");
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
      created.push({ branch, prNumber: pr.data.number, title });
    } catch {
      // branch may have no diff against base, or a race — skip
    }
  }
  return created;
}
