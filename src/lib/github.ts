import { Octokit } from "octokit";

let cached: Octokit | null = null;
export function octokit(): Octokit {
  if (cached) return cached;
  cached = new Octokit({ auth: process.env.GITHUB_TOKEN });
  return cached;
}

export function siteRepo(): { owner: string; repo: string } {
  const full = process.env.GITHUB_REPO || "Helsinki-Code/seo-forge";
  const [owner, repo] = full.split("/");
  return { owner, repo };
}

export async function listOpenPRs() {
  const { owner, repo } = siteRepo();
  const res = await octokit().rest.pulls.list({
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
    additions: undefined as number | undefined,
  }));
}

export async function mergePR(prNumber: number) {
  const { owner, repo } = siteRepo();
  return octokit().rest.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    merge_method: "squash",
  });
}

export async function closePR(prNumber: number) {
  const { owner, repo } = siteRepo();
  return octokit().rest.pulls.update({
    owner,
    repo,
    pull_number: prNumber,
    state: "closed",
  });
}

/**
 * The agent → PR bridge. Agents push `seo/*` branches (never PRs, never main);
 * this scans for agent branches with no open PR and opens one for each, so
 * every proposed change surfaces in the Approvals queue.
 */
export async function syncAgentBranches(): Promise<
  { branch: string; prNumber: number; title: string }[]
> {
  const { owner, repo } = siteRepo();
  const gh = octokit();

  const [branches, openPRs] = await Promise.all([
    gh.rest.repos.listBranches({ owner, repo, per_page: 100 }),
    gh.rest.pulls.list({ owner, repo, state: "open", per_page: 100 }),
  ]);

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
        base: "main",
        title,
        body: [
          "Proposed by the SEO Forge agent team.",
          "",
          "Review the diff, then approve or reject from the SEO Forge Approvals",
          "dashboard (or directly here). Merging deploys via the repo pipeline.",
          "",
          "🤖 Generated with [Claude Code](https://claude.com/claude-code)",
        ].join("\n"),
      });
      created.push({ branch, prNumber: pr.data.number, title });
    } catch {
      // branch may have no diff against main, or a race — skip
    }
  }
  return created;
}
