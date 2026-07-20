import { Bot, Newspaper, SearchCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import RankChart, { RankPoint } from "@/components/RankChart";
import RunAgentButton from "@/components/RunAgentButton";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import DivisionPanel from "@/components/DivisionPanel";
import { AGENT_TEAM } from "@/lib/agents";
import { auth } from "@clerk/nextjs/server";
import ConnectPrompt from "@/components/ConnectPrompt";
import {
  computeHealthScoreFromFindings,
  getApprovals,
  getFindings,
  getHealthScore,
  getKeywords,
  getRuns,
  getSnapshots,
  getUserSite,
} from "@/lib/data";

export const dynamic = "force-dynamic";

function isWithinDays(iso: string, days: number): boolean {
  return new Date(iso).getTime() > Date.now() - days * 864e5;
}

export default async function OverviewPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;
  const { data: keywords } = await getKeywords(site.id);
  const { data: snapshots } = await getSnapshots(keywords.map((k) => k.id));
  const { data: runs } = await getRuns(site.id, 20);
  const { data: approvals } = await getApprovals(site.id);
  const { data: findings } = await getFindings(site.id, "open");
  const { data: storedHealth } = await getHealthScore(site.id);
  const computedHealth = computeHealthScoreFromFindings(findings);
  const health = storedHealth ?? { ...computedHealth, computed_at: null as string | null };

  const contentRuns = runs.filter((r) => r.agent_name === AGENT_TEAM.contentGrowth.name);
  const optimizationRuns = runs.filter((r) => r.agent_name === AGENT_TEAM.searchOptimization.name);
  const contentFindings = findings.filter((f) => f.source_agent === "content_growth");
  const optimizationFindings = findings.filter((f) => f.source_agent === "search_optimization");

  const runningByAgent = new Map<string, number>();
  for (const r of runs) {
    if (r.status !== "running") continue;
    runningByAgent.set(r.agent_name, (runningByAgent.get(r.agent_name) ?? 0) + 1);
  }
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const preparedApprovals = pendingApprovals.filter((a) => a.kind === "proposal" && !a.pr_number);
  const actionableApprovals = pendingApprovals.filter((a) => a.kind !== "proposal" || a.pr_number);
  const approvedApprovals = approvals.filter((a) => a.status === "approved");
  const mergedThisWeek = approvals.filter(
    (a) => a.status === "merged" && a.decided_at && isWithinDays(a.decided_at, 7),
  );

  const latestByKeyword = new Map<string, number | null>();
  for (const s of snapshots) latestByKeyword.set(s.keyword_id, s.position);
  const positions = [...latestByKeyword.values()].filter((p): p is number => p !== null);
  const avgPosition = positions.length
    ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)
    : "—";

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
      <PageHeader title="Mission Control" subtitle={`${site.url} · Supervisor coordinating both divisions`}>
        <RunAgentButton
          agent="supervisor"
          kind="full_review"
          label="Run full SEO review"
          prompt={`Run a full autonomous cycle for ${site.url}: investigate opportunities and search performance, delegate to the right specialists, and prepare validated proposals for anything requiring a site or content change. Nothing goes live without human approval.`}
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
              so the Search Optimization division knows what to defend and improve.
            </li>
            <li>
              Hit <strong className="text-fg">Run full SEO review</strong> (top right) — the
              Supervisor delegates to Content Growth and Search Optimization, which hand off
              implementation to the Site Experience Engineer.
            </li>
            <li>
              Approve or reject the proposals in{" "}
              <Link href="/dashboard/approvals" className="text-primary hover:underline">
                Production
              </Link>{" "}
              — approving ships them (PR merge or WordPress publish).
            </li>
          </ol>
        </div>
      )}

      {/* Supervisor status strip */}
      <section className="panel mb-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bot size={16} className="text-primary" aria-hidden />
          Supervisor
        </div>
        <span className="text-xs text-fg-mute">
          <span className="display font-semibold text-fg">
            {[...runningByAgent.values()].reduce((a, b) => a + b, 0)}
          </span>{" "}
          runs in flight
        </span>
        <span className="text-xs text-fg-mute">
          <span className="display font-semibold text-fg">{findings.length}</span> open findings across
          both divisions
        </span>
        <span className="text-xs text-fg-mute">
          <span className="display font-semibold text-fg">{pendingApprovals.length}</span> awaiting your
          decision
        </span>
        <Link href="/dashboard/agents" className="ml-auto text-xs text-primary hover:underline">
          Supervisor room →
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DivisionPanel
          title="Creating New Content"
          subtitle="Content Growth — opportunity research, briefs, drafts, media, publishing handoff."
          icon={Newspaper}
          runs={contentRuns}
          findings={contentFindings}
          href="/dashboard/content"
        />
        <DivisionPanel
          title="Optimizing Existing Content"
          subtitle="Search Optimization — rankings, technical SEO, decay, cannibalization, backlinks, GEO."
          icon={SearchCheck}
          runs={optimizationRuns}
          findings={optimizationFindings}
          href="/dashboard/rankings"
        />
      </div>

      {/* Shared production pipeline */}
      <section className="panel mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-primary" aria-hidden />
            <h2 className="text-sm font-semibold">Production pipeline — Site Experience Engineer</h2>
          </div>
          <Link href="/dashboard/approvals" className="text-xs text-primary hover:underline">
            open Production →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="display text-2xl font-semibold">{preparedApprovals.length}</p>
            <p className="text-xs text-fg-faint">prepared, implementing</p>
          </div>
          <div>
            <p className="display text-2xl font-semibold text-amber">{actionableApprovals.length}</p>
            <p className="text-xs text-fg-faint">pending your approval</p>
          </div>
          <div>
            <p className="display text-2xl font-semibold text-mint">{approvedApprovals.length}</p>
            <p className="text-xs text-fg-faint">approved</p>
          </div>
          <div>
            <p className="display text-2xl font-semibold text-primary">{mergedThisWeek.length}</p>
            <p className="text-xs text-fg-faint">deployed this week</p>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <HealthScoreGauge
          overall={health.overall}
          categoryScores={health.category_scores}
          computedAt={health.computed_at}
        />
      </div>

      <section className="panel mt-6 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Ranking trajectory — hero keywords</h2>
            <span className="text-xs text-fg-faint">
              {keywords.length} tracked · avg. position {avgPosition}
            </span>
          </div>
          <Link href="/dashboard/rankings" className="text-xs text-primary hover:underline">
            all keywords →
          </Link>
        </div>
        <RankChart points={points} keywords={topKeywords.map((k) => k.keyword)} />
      </section>

      <section className="panel mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent activity — all agents</h2>
          <Link href="/dashboard/agents" className="text-xs text-primary hover:underline">
            Supervisor room →
          </Link>
        </div>
        <ul className="divide-y divide-edge">
          {runs.slice(0, 8).map((r) => (
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
              <Link href={`/dashboard/runs/${r.id}`} className="text-xs text-primary hover:underline">
                read findings →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
