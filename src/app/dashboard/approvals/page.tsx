/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { GitPullRequest, Globe, ShieldCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import ApprovalActions from "@/components/ApprovalActions";
import SyncBranchesButton from "@/components/SyncBranchesButton";
import ConnectPrompt from "@/components/ConnectPrompt";
import { EditTool } from "@/components/ui/edit-tool";
import { getApprovals, type Approval, getUserSite } from "@/lib/data";
import { listOpenPRs, siteRepoOf } from "@/lib/github";

export const dynamic = "force-dynamic";

type DiffFile = { path: string; patch?: string; oldContent?: string; newContent?: string };

/** Verified live against a real Site Experience Engineer ImplementationProposal:
 * `diff_summary` is `{format: "unified", files: [{path, patch}]}` — a unified-diff
 * PATCH string per file, not full before/after file contents. Falls back to an
 * oldContent/newContent shape in case a future schema version changes this. */
function parseDiffFiles(diffSummary: Approval["diff_summary"]): DiffFile[] | null {
  if (!diffSummary || typeof diffSummary !== "object") return null;
  const raw = (diffSummary as Record<string, unknown>).files ?? (diffSummary as Record<string, unknown>).changes;
  if (!Array.isArray(raw)) return null;
  const files: DiffFile[] = [];
  for (const f of raw) {
    if (!f || typeof f !== "object") continue;
    const r = f as Record<string, unknown>;
    const path = (r.path as string) ?? (r.filePath as string) ?? (r.file as string);
    if (!path) continue;
    files.push({
      path,
      patch: (r.patch as string) ?? undefined,
      oldContent: (r.oldContent as string) ?? (r.before as string) ?? undefined,
      newContent: (r.newContent as string) ?? (r.after as string) ?? (r.content as string) ?? undefined,
    });
  }
  return files.length > 0 ? files : null;
}

/** Verified live: `screenshots` is nested one level by viewport, e.g.
 * `{desktop: {before, after}, mobile: {before, after}, note}` — not a flat
 * label→url map. Walks up to 2 levels deep collecting any string leaf,
 * labeled by its path, so it degrades gracefully if the shape varies. */
function flattenScreenshots(screenshots: unknown, prefix = ""): { label: string; url: string }[] {
  if (!screenshots || typeof screenshots !== "object") return [];
  const out: { label: string; url: string }[] = [];
  for (const [key, value] of Object.entries(screenshots as Record<string, unknown>)) {
    if (key === "note") continue;
    const label = prefix ? `${prefix} ${key}` : key;
    if (typeof value === "string") out.push({ label, url: value });
    else if (value && typeof value === "object" && !prefix) out.push(...flattenScreenshots(value, key));
  }
  return out;
}

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
            {pending.map((a) => {
              const files = parseDiffFiles(a.diff_summary);
              const canApply = !!a.pr_number || (a.kind === "wp_update" || a.kind === "wp_new");
              return (
                <li key={a.id} className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      {a.detail && <p className="mt-0.5 text-xs text-fg-mute">{a.detail}</p>}
                      <p className="mt-1 text-[11px] text-fg-faint">
                        {a.kind}
                        {a.pr_number ? ` · PR #${a.pr_number}` : ""} · {timeAgo(a.created_at)}
                      </p>
                    </div>
                    {canApply ? (
                      <ApprovalActions approvalId={a.id} prNumber={a.pr_number ?? undefined} title={a.title} />
                    ) : (
                      <span className="shrink-0 rounded-full bg-panel-2 px-2.5 py-0.5 text-[11px] font-medium text-fg-mute">
                        awaiting implementation
                      </span>
                    )}
                  </div>

                  {files && (
                    <div className="space-y-2">
                      {files.map((f) => (
                        <EditTool
                          key={f.path}
                          filePath={f.path}
                          patch={f.patch}
                          oldContent={f.oldContent ?? ""}
                          newContent={f.newContent ?? ""}
                        />
                      ))}
                    </div>
                  )}

                  {(a.risk || a.confidence != null || a.rollback_plan || a.screenshots || a.lighthouse) && (
                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-panel-2 p-3 text-xs sm:grid-cols-4">
                      {a.risk && (
                        <div>
                          <p className="text-fg-faint">Risk</p>
                          <p className="mt-0.5 font-medium capitalize text-fg">{a.risk}</p>
                        </div>
                      )}
                      {a.confidence != null && (
                        <div>
                          <p className="text-fg-faint">Confidence</p>
                          <p className="mt-0.5 font-medium text-fg">{Math.round(a.confidence * 100)}%</p>
                        </div>
                      )}
                      {a.rollback_plan && (
                        <div className="col-span-2 sm:col-span-4">
                          <p className="text-fg-faint">Rollback plan</p>
                          <p className="mt-0.5 text-fg-mute">{a.rollback_plan}</p>
                        </div>
                      )}
                      {a.lighthouse != null && (
                        <div className="col-span-2 sm:col-span-4">
                          <p className="text-fg-faint">Lighthouse / accessibility comparison</p>
                          <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap text-[11px] text-fg-mute">
                            {JSON.stringify(a.lighthouse, null, 2)}
                          </pre>
                        </div>
                      )}
                      {a.screenshots != null && flattenScreenshots(a.screenshots).length > 0 && (
                        <div className="col-span-2 sm:col-span-4">
                          <p className="mb-1 text-fg-faint">Screenshots</p>
                          <div className="flex flex-wrap gap-2">
                            {flattenScreenshots(a.screenshots).map(({ label, url }) => (
                              <a key={label} href={url} target="_blank" rel="noreferrer" className="block">
                                <img
                                  src={url}
                                  alt={label}
                                  className="h-20 w-32 rounded border border-edge object-cover"
                                />
                                <span className="mt-0.5 block text-[10px] text-fg-faint">{label}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
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
