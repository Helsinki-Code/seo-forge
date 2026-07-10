import { GitPullRequest, ShieldCheck } from "lucide-react";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import ApprovalActions from "@/components/ApprovalActions";
import { getApprovals } from "@/lib/data";
import { listOpenPRs, siteRepo } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const { data: approvals, demo } = await getApprovals();
  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending").slice(0, 10);

  let prs: Awaited<ReturnType<typeof listOpenPRs>> = [];
  let prError = "";
  try {
    prs = await listOpenPRs();
  } catch (e) {
    prError = e instanceof Error ? e.message : "GitHub unreachable";
  }
  const { owner, repo } = siteRepo();

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle="You are the deploy gate. Approving a PR merges it — your pipeline takes it live."
      />
      <DemoBanner demo={demo} />

      <section className="panel mb-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <GitPullRequest size={16} className="text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">
            Open pull requests — {owner}/{repo}
          </h2>
        </div>
        {prError && (
          <p className="text-xs text-rose">
            Couldn&apos;t reach GitHub: {prError}. Check GITHUB_TOKEN in .env.local.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber" aria-hidden />
            <h2 className="text-sm font-semibold">Agent-proposed actions</h2>
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
