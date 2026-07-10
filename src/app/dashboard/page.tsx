import { ArrowUpRight, Bot, GitPullRequest, LineChart, Target } from "lucide-react";
import Link from "next/link";
import { DemoBanner, PageHeader, StatCard, StatusBadge, timeAgo } from "@/components/ui";
import RankChart, { RankPoint } from "@/components/RankChart";
import RunAgentButton from "@/components/RunAgentButton";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline";
import { getActivity, getApprovals, getKeywords, getRuns, getSite, getSnapshots } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const { data: site } = await getSite();
  const { data: keywords, demo } = await getKeywords(site?.id ?? "demo");
  const { data: snapshots } = await getSnapshots(keywords.map((k) => k.id));
  const { data: runs } = await getRuns(6);
  const { data: approvals } = await getApprovals("pending");
  const { data: activity } = await getActivity(8);

  const latestByKeyword = new Map<string, number | null>();
  for (const s of snapshots) latestByKeyword.set(s.keyword_id, s.position);
  const positions = [...latestByKeyword.values()].filter((p): p is number => p !== null);
  const avg = positions.length
    ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)
    : "—";
  const top3 = positions.filter((p) => p <= 3).length;

  const topKeywords = keywords.slice(0, 3);
  const byDate = new Map<string, RankPoint>();
  for (const s of snapshots) {
    const kw = topKeywords.find((k) => k.id === s.keyword_id);
    if (!kw) continue;
    const date = s.checked_at.slice(5, 10);
    const row = byDate.get(date) ?? { date };
    row[kw.keyword] = s.position;
    byDate.set(date, row);
  }
  const points = [...byDate.values()];

  return (
    <>
      <PageHeader
        title="Mission Control"
        subtitle={`${site?.url ?? "your site"} · agents on watch`}
      >
        <RunAgentButton
          agent="strategist"
          kind="full_review"
          label="Run full SEO review"
          prompt={`Run a full autonomous SEO review of ${site?.url ?? "https://seoforge.online"}: crawl the site, run fresh SERP checks for priority keywords, identify the 3 highest-impact optimizations, and output an exact change plan for the ${site?.github_repo ?? "Helsinki-Code/seo-forge"} repository. Do not deploy anything — changes ship via human-approved pull requests.`}
        />
      </PageHeader>

      <DemoBanner demo={demo} />

      {keywords.length === 0 && !demo && (
        <div className="panel mb-6 border-primary/40 p-5">
          <p className="text-sm font-semibold">Get the loop spinning — 3 steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-fg-mute">
            <li>
              <Link href="/dashboard/rankings" className="text-primary hover:underline">
                Add your first keywords
              </Link>{" "}
              so the agents know what to rank for.
            </li>
            <li>
              Hit <strong className="text-fg">Run full SEO review</strong> (top right) — the
              agent gets the website repo mounted and pushes proposed changes as{" "}
              <code className="display">seo/*</code> branches.
            </li>
            <li>
              Approve or reject the resulting PRs in{" "}
              <Link href="/dashboard/approvals" className="text-primary hover:underline">
                Approvals
              </Link>{" "}
              — merging deploys.
            </li>
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Target} label="Tracked keywords" value={String(keywords.length)} hint="across the site" />
        <StatCard icon={LineChart} label="Avg. position" value={String(avg)} hint="lower is better" tone="accent" />
        <StatCard icon={ArrowUpRight} label="Top-3 rankings" value={String(top3)} hint="keywords in positions 1–3" tone="mint" />
        <StatCard icon={GitPullRequest} label="Pending approvals" value={String(approvals.length)} hint="awaiting your decision" tone="rose" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Ranking trajectory — hero keywords</h2>
            <Link href="/dashboard/rankings" className="text-xs text-primary hover:underline">
              all keywords →
            </Link>
          </div>
          <RankChart points={points} keywords={topKeywords.map((k) => k.keyword)} />
        </section>

        <section className="panel p-6">
          <h2 className="mb-5 text-sm font-semibold">Live activity</h2>
          <Timeline className="max-h-80 overflow-y-auto pr-1">
            {activity.map((a, i) => (
              <TimelineItem key={a.id} status="done">
                <TimelineHeading className="text-xs font-medium text-fg">
                  <span className="mr-2 text-fg-faint">{timeAgo(a.created_at)}</span>
                  {a.actor}
                </TimelineHeading>
                <TimelineDot status={i === 0 ? "current" : "done"} />
                {i < activity.length - 1 && <TimelineLine done />}
                <TimelineContent className="pb-4 text-xs leading-relaxed text-fg-mute">
                  {a.message}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </section>
      </div>

      <section className="panel mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent agent runs</h2>
          <Link href="/dashboard/agents" className="text-xs text-primary hover:underline">
            manage agents →
          </Link>
        </div>
        <ul className="divide-y divide-edge">
          {runs.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
              <Bot size={15} className="text-primary" aria-hidden />
              <Link
                href={`/dashboard/runs/${r.id}`}
                className="min-w-40 text-sm font-medium transition-colors duration-200 hover:text-primary"
              >
                {r.agent_name}
              </Link>
              <StatusBadge status={r.status} />
              <span className="flex-1 truncate text-xs text-fg-mute">{r.summary ?? r.kind}</span>
              <span className="text-xs text-fg-faint">{timeAgo(r.created_at)}</span>
              <Link
                href={`/dashboard/runs/${r.id}`}
                className="text-xs text-primary hover:underline"
              >
                read findings →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
