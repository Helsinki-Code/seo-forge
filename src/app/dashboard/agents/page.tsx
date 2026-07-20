import Link from "next/link";
import { Bot, Newspaper, SearchCheck, Wrench } from "lucide-react";
import { PageHeader, StatusBadge, timeAgo, DemoBanner } from "@/components/ui";
import RunAgentButton from "@/components/RunAgentButton";
import LiveAgentActivity from "@/components/LiveAgentActivity";
import { AGENT_TEAM, AgentKey } from "@/lib/agents";
import { auth } from "@clerk/nextjs/server";
import ConnectPrompt from "@/components/ConnectPrompt";
import { type AgentRun, getApprovals, getFindings, getRuns, getUserSite } from "@/lib/data";

export const dynamic = "force-dynamic";

const PROMPTS: Record<AgentKey, { kind: string; prompt: (url: string, repo: string) => string }> = {
  supervisor: {
    kind: "full_review",
    prompt: (url) =>
      `Run a full autonomous cycle for ${url}: investigate opportunities and search performance, delegate to the right specialists, and prepare validated proposals for anything requiring a site or content change. Nothing goes live without human approval.`,
  },
  contentGrowth: {
    kind: "content",
    prompt: (url) =>
      `Research the highest-impact content opportunity for ${url} right now, produce an evidence-backed brief, write the complete draft, and specify any media it needs.`,
  },
  searchOptimization: {
    kind: "serp_check",
    prompt: (url) =>
      `Run a fresh technical and ranking review of ${url}: crawl for technical issues, check priority keyword rankings and SERP features, and identify the top 3 evidence-backed findings with recommended actions.`,
  },
  siteExperience: {
    kind: "deploy",
    prompt: (url, repo) =>
      `Review the latest approved content and optimization requests for ${url}, implement them as a validated pull request against ${repo}, and prepare the proposal for human review.`,
  },
};

function DivisionColumn({
  icon: Icon,
  title,
  agentKey,
  runs: divisionRuns,
  findingsCount,
  url,
  repo,
}: {
  icon: typeof Newspaper;
  title: string;
  agentKey: AgentKey;
  runs: AgentRun[];
  findingsCount: number;
  url: string;
  repo: string;
}) {
  const running = divisionRuns.find((r) => r.status === "running");
  const latest = divisionRuns[0];
  const cfg = PROMPTS[agentKey];
  return (
    <div className="panel flex flex-col p-5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary" aria-hidden />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {latest && <StatusBadge status={latest.status} />}
      </div>
      <p className="mb-3 text-xs leading-relaxed text-fg-mute">{AGENT_TEAM[agentKey].role}</p>
      <p className="mb-4 text-xs text-fg-faint">{findingsCount} open findings feeding this division</p>

      {running && <LiveAgentActivity runId={running.id} isRunning />}

      <div className="mb-4 flex-1 space-y-1.5">
        {divisionRuns.length === 0 && <p className="text-xs text-fg-faint">No runs yet.</p>}
        {divisionRuns.slice(0, 4).map((r) => (
          <Link
            key={r.id}
            href={`/dashboard/runs/${r.id}`}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition-colors duration-200 hover:bg-panel-2"
          >
            <StatusBadge status={r.status} />
            <span className="min-w-0 flex-1 truncate text-fg-mute">{r.summary ?? r.kind}</span>
            <span className="shrink-0 text-fg-faint">{timeAgo(r.created_at)}</span>
          </Link>
        ))}
      </div>

      <RunAgentButton agent={agentKey} kind={cfg.kind} label="Run now" prompt={cfg.prompt(url, repo)} />
    </div>
  );
}

export default async function AgentsPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;
  const { data: runs } = await getRuns(site.id, 40);
  const { data: findings } = await getFindings(site.id, "open");
  const { data: approvals } = await getApprovals(site.id);
  const url = site.url;
  const repo = site.github_repo ?? site.url;

  const runsByAgent = (name: string) => runs.filter((r) => r.agent_name === name);

  const supervisorRuns = runsByAgent(AGENT_TEAM.supervisor.name);
  const contentRuns = runsByAgent(AGENT_TEAM.contentGrowth.name);
  const optimizationRuns = runsByAgent(AGENT_TEAM.searchOptimization.name);
  const siteExpRuns = runsByAgent(AGENT_TEAM.siteExperience.name);

  const contentFindings = findings.filter((f) => f.source_agent === "content_growth");
  const optimizationFindings = findings.filter((f) => f.source_agent === "search_optimization");

  const awaitingImplementation = approvals.filter(
    (a) => a.kind === "proposal" && a.status === "pending" && !a.pr_number,
  );
  const delivered = approvals.filter((a) => a.status === "merged" || a.status === "approved");

  const latestFullReview = supervisorRuns.find((r) => r.kind === "full_review");

  return (
    <>
      <PageHeader
        title="Supervisor"
        subtitle="Coordinates Content Growth and Search Optimization, delegates implementation to the Site Experience Engineer."
      >
        <RunAgentButton
          agent="supervisor"
          kind={PROMPTS.supervisor.kind}
          label="Run now"
          prompt={PROMPTS.supervisor.prompt(url, repo)}
        />
      </PageHeader>
      <DemoBanner demo={demo} />

      {/* Supervisor summary */}
      <section className="panel mb-6 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Bot size={16} className="text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">Latest scheduled review</h2>
        </div>
        {latestFullReview ? (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <StatusBadge status={latestFullReview.status} />
            <span className="text-fg-mute">{latestFullReview.summary ?? "in progress"}</span>
            <span className="text-fg-faint">{timeAgo(latestFullReview.created_at)}</span>
            <Link href={`/dashboard/runs/${latestFullReview.id}`} className="text-primary hover:underline">
              view →
            </Link>
          </div>
        ) : (
          <p className="text-xs text-fg-faint">No scheduled review has run yet.</p>
        )}
        <p className="mt-3 text-[11px] text-fg-faint">
          Conflict prevention: the Supervisor refuses to start a second run on this site while one is
          already in progress — not a full budget/quota system, just the one concurrency check this app
          enforces today.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DivisionColumn
          icon={Newspaper}
          title="Content Growth"
          agentKey="contentGrowth"
          runs={contentRuns}
          findingsCount={contentFindings.length}
          url={url}
          repo={repo}
        />
        <DivisionColumn
          icon={SearchCheck}
          title="Search Optimization"
          agentKey="searchOptimization"
          runs={optimizationRuns}
          findingsCount={optimizationFindings.length}
          url={url}
          repo={repo}
        />
      </div>

      {/* Site Experience Engineer — shared delivery lane */}
      <section className="panel mt-6 p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-primary" aria-hidden />
            <h3 className="text-sm font-semibold">Site Experience Engineer — delivery lane</h3>
          </div>
          {siteExpRuns[0] && <StatusBadge status={siteExpRuns[0].status} />}
        </div>
        <p className="mb-3 text-xs leading-relaxed text-fg-mute">{AGENT_TEAM.siteExperience.role}</p>
        <div className="mb-4 flex items-center gap-6 text-xs">
          <span className="text-fg-mute">
            <span className="display font-semibold text-fg">{awaitingImplementation.length}</span> awaiting
            implementation
          </span>
          <span className="text-fg-mute">
            <span className="display font-semibold text-fg">{delivered.length}</span> delivered
          </span>
          <Link href="/dashboard/approvals" className="ml-auto text-xs text-primary hover:underline">
            open Production →
          </Link>
        </div>
        <div className="mb-4 space-y-1.5">
          {siteExpRuns.length === 0 && <p className="text-xs text-fg-faint">No runs yet.</p>}
          {siteExpRuns.slice(0, 4).map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/runs/${r.id}`}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition-colors duration-200 hover:bg-panel-2"
            >
              <StatusBadge status={r.status} />
              <span className="min-w-0 flex-1 truncate text-fg-mute">{r.summary ?? r.kind}</span>
              <span className="shrink-0 text-fg-faint">{timeAgo(r.created_at)}</span>
            </Link>
          ))}
        </div>
        <RunAgentButton
          agent="siteExperience"
          kind={PROMPTS.siteExperience.kind}
          label="Run now"
          prompt={PROMPTS.siteExperience.prompt(url, repo)}
        />
      </section>
    </>
  );
}
