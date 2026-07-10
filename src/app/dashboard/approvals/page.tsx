import Link from "next/link";
import { GitPullRequest, Globe, ShieldCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import ApprovalActions from "@/components/ApprovalActions";
import SyncBranchesButton from "@/components/SyncBranchesButton";
import ConnectPrompt from "@/components/ConnectPrompt";
import { getApprovals, getUserSite } from "@/lib/data";
import { listOpenPRs, siteRepoOf } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;

  const { data: approvals } = await getApprovals(site.id);
  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending").slice(0, 10);

  const isGithub = (site.platform ?? "github") === "github";
  let prs: Awaited<ReturnType<typeof listOpenPRs>> = [];
  let prError = "";
  let repoLabel = "";
  if (isGithub) {
    try {
      const { owner, repo } = siteRepoOf(site);
      repoLabel = `${owner}/${repo}`;
      prs = await listOpenPRs(site);
    } catch (e) {
      prError = e instanceof Error ? e.message : "GitHub unreachable";
    }
  }

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle={
          isGithub
            ? "You are the deploy gate. Approving a PR merges it — your pipeline takes it live."
            : "You are the publish gate. Approving a change applies it to WordPress instantly."
        }
      >
        {isGithub && <SyncBranchesButton />}
      </PageHeader>
      <DemoBanner demo={demo} />

      {isGithub ? (
        <section className="panel mb-6 p-6">
          <div className="mb-4 flex items-center gap-2">
            <GitPullRequest size={16} className="text-primary" aria-hidden />
            <h2 className="text-sm font-semibold">Open pull requests — {repoLabel}</h2>
          </div>
          {prError && (
            <p className="text-xs text-rose">
              Couldn&apos;t reach GitHub: {prError}. Check the token on{" "}
              <Link href="/dashboard/connect" className="text-primary hover:underline">
                your site connection
              </Link>
              .
            </p>
          )}
          {!prError && prs.length === 0 && (
            <p className="text-xs text-fg-faint">
              No open PRs. When agents propose site changes, they land here for your decision.
            </p>
          )}
          <ul className="divide-y divide-edge">
            {prs.map((pr) => (
              <li key={pr.number} className="flex flex-wrap items-center gap-3 py-3">
                <span className="display text-xs text-fg-faint">#{pr.number}</span>
                <div className="min-w-0 flex-1">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-fg hover:text-primary hover:underline"
                  >
                    {pr.title}
                  </a>
                  <p className="text-xs text-fg-faint">
                    {pr.branch} · by {pr.author} · {timeAgo(pr.createdAt)}
                  </p>
                </div>
                <ApprovalActions prNumber={pr.number} title={pr.title} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="panel mb-6 flex items-start gap-3 p-6">
          <Globe size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-fg-mute">
            <strong className="text-fg">WordPress mode.</strong> When agent runs finish,
            their proposed changes appear below as approval cards. Approving applies the
            change to {site.url} through the WordPress REST API — publish-gated by you.
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber" aria-hidden />
            <h2 className="text-sm font-semibold">Agent-proposed changes</h2>
          </div>
          {pending.length === 0 && (
            <p className="text-xs text-fg-faint">Nothing waiting on you right now.</p>
          )}
          <ul className="divide-y divide-edge">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.detail && <p className="mt-0.5 text-xs text-fg-mute">{a.detail}</p>}
                  <p className="mt-1 text-[11px] text-fg-faint">
                    {a.kind}
                    {a.pr_number ? ` · PR #${a.pr_number}` : ""} · {timeAgo(a.created_at)}
                  </p>
                </div>
                <ApprovalActions
                  approvalId={a.id}
                  prNumber={a.pr_number ?? undefined}
                  title={a.title}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-6">
          <h2 className="mb-4 text-sm font-semibold">Decision history</h2>
          {decided.length === 0 && <p className="text-xs text-fg-faint">No decisions yet.</p>}
          <ul className="divide-y divide-edge">
            {decided.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1 truncate text-sm">{a.title}</span>
                <StatusBadge status={a.status} />
                <span className="text-[11px] text-fg-faint">{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
