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
