import Link from "next/link";
import { PageHeader, StatusBadge, timeAgo, DemoBanner } from "@/components/ui";
import RunAgentButton from "@/components/RunAgentButton";
import { AiLoader } from "@/components/ui/ai-agent-processing-states";
import { AGENT_TEAM, AgentKey } from "@/lib/agents";
import { auth } from "@clerk/nextjs/server";
import ConnectPrompt from "@/components/ConnectPrompt";
import { getRuns, getUserSite } from "@/lib/data";

export const dynamic = "force-dynamic";

const PROMPTS: Record<AgentKey, { kind: string; prompt: (url: string, repo: string) => string }> = {
  orchestrator: {
    kind: "full_review",
    prompt: (url, repo) =>
      `Coordinate a full content-production and optimization cycle for ${url}. Work batch by batch, and route every site change through a pull request on ${repo} for human approval.`,
  },
  blogger: {
    kind: "content",
    prompt: (url) =>
      `Review the current blog plan for ${url} and propose the next 5 articles with target keywords, based on fresh research. Return blog_plan and content_calendar updates.`,
  },
  contextBuilder: {
    kind: "content",
    prompt: (url) =>
      `Refresh the product marketing context for ${url} from the latest blog plan and content calendar. Flag inferred sections.`,
  },
  siteArchitect: {
    kind: "full_review",
    prompt: (url) =>
      `Audit the information architecture of ${url}: hierarchy, URL patterns, nav, internal links. Output an updated architecture plan with fixes ranked by impact.`,
  },
  strategist: {
    kind: "serp_check",
    prompt: (url) =>
      `Run fresh SERP analysis for the priority keywords of ${url}. Record position movements, SERP-feature changes, and the top 3 optimization opportunities with exact title/meta rewrites.`,
  },
  writer: {
    kind: "content",
    prompt: (url) =>
      `Pick the highest-impact content refresh for ${url} from the latest strategy output and write the complete updated article with verified external links, internal links, and image specs.`,
  },
  imageGenerator: {
    kind: "media",
    prompt: (url) =>
      `Review recent articles on ${url}, understand their tone and style, and generate missing featured/in-content images with SEO alt text. Return a labeled manifest.`,
  },
  affiliate: {
    kind: "content",
    prompt: (url) =>
      `Research affiliate opportunities for the latest articles on ${url}. Map product, program, commission, and placement per article with sources.`,
  },
};

export default async function AgentsPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;
  const { data: runs } = await getRuns(site.id, 30);
  const url = site.url;
  const repo = site.github_repo ?? site.url;

  return (
    <>
      <PageHeader
        title="Agent Team"
        subtitle="Eight specialists. Every change they make ships through your approval."
      />
      <DemoBanner demo={demo} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(AGENT_TEAM) as AgentKey[]).map((key) => {
          const agent = AGENT_TEAM[key];
          const lastRun = runs.find((r) => r.agent_name === agent.name);
          const running = lastRun?.status === "running";
          const cfg = PROMPTS[key];
          return (
            <div key={key} className="panel flex flex-col p-5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{agent.name}</h3>
                {lastRun && <StatusBadge status={lastRun.status} />}
              </div>
              <p className="mb-4 text-xs leading-relaxed text-fg-mute">{agent.role}</p>
              {running ? (
                <div className="mb-4">
                  <AiLoader variant="dots" text="Working…" />
                </div>
              ) : (
                lastRun && (
                  <p className="mb-4 line-clamp-2 text-xs text-fg-faint">
                    Last: {lastRun.summary ?? lastRun.kind} · {timeAgo(lastRun.created_at)}{" "}
                    <Link href={`/dashboard/runs/${lastRun.id}`} className="text-primary hover:underline">
                      view →
                    </Link>
                  </p>
                )
              )}
              <div className="mt-auto">
                <RunAgentButton
                  agent={key}
                  kind={cfg.kind}
                  label="Run now"
                  prompt={cfg.prompt(url, repo)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
