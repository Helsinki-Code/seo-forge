import Link from "next/link";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import RunAgentButton from "@/components/RunAgentButton";
import Plan, { Task } from "@/components/ui/agent-plan";
import { auth } from "@clerk/nextjs/server";
import ConnectPrompt from "@/components/ConnectPrompt";
import { getRuns, getUserSite } from "@/lib/data";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const seoPlan: Task[] = [
  {
    id: "1",
    title: "SERP sweep on priority keywords",
    description: "Fresh top-10 analysis, SERP features, and position movements",
    status: "completed",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      { id: "1.1", title: "Crawl site & sitemap", description: "Inventory current pages and metadata", status: "completed", priority: "high", tools: ["web_fetch", "firecrawl"] },
      { id: "1.2", title: "Analyze live SERPs", description: "Top-10 per keyword with feature map", status: "completed", priority: "high", tools: ["web_search"] },
    ],
  },
  {
    id: "2",
    title: "Rewrite underperforming titles & metas",
    description: "CTR-optimized rewrites grounded in SERP patterns — no fabricated claims",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: ["1"],
    subtasks: [
      { id: "2.1", title: "Draft rewrites", description: "Unique, SERP-informed titles under 60 chars", status: "in-progress", priority: "high", tools: ["seo-strategy-agent"] },
      { id: "2.2", title: "Open pull request", description: "File-level changes for human approval", status: "pending", priority: "high", tools: ["github"] },
    ],
  },
  {
    id: "3",
    title: "Internal linking pass (hub → spokes)",
    description: "Link pillar page to all spoke articles with descriptive anchors",
    status: "pending",
    priority: "medium",
    level: 0,
    dependencies: ["1"],
    subtasks: [
      { id: "3.1", title: "Map link opportunities", description: "From site architecture URL map", status: "pending", priority: "medium", tools: ["site-architecture-agent"] },
    ],
  },
  {
    id: "4",
    title: "Refresh decaying content",
    description: "Update stats, links, and FAQs on articles losing positions",
    status: "pending",
    priority: "medium",
    level: 0,
    dependencies: ["2"],
    subtasks: [
      { id: "4.1", title: "Rewrite with verified sources", description: "Full body refresh with real citations", status: "pending", priority: "medium", tools: ["seo-writer-agent"] },
      { id: "4.2", title: "Regenerate matching media", description: "Images in the article's tone & style", status: "pending", priority: "low", tools: ["image-generator"] },
    ],
  },
];

export default async function ContentPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;
  const { data: runs } = await getRuns(site.id, 30);
  const contentRuns = runs.filter((r) => ["content", "full_review"].includes(r.kind));
  const url = site.url;
  const repo = site.github_repo ?? site.url;

  return (
    <>
      <PageHeader
        title="Content Operations"
        subtitle="The optimization queue the agents are working through — every change lands as a PR."
      >
        <div className="flex flex-wrap gap-3">
          <RunAgentButton
            agent="writer"
            kind="content"
            label="Refresh weakest article"
            compact
            prompt={`Identify the weakest-performing article on ${url} from the latest strategy output and rewrite it completely: verified external links, internal links from the site architecture, image prompts with alt text. Output the full article plus the exact file change for ${repo}.`}
          />
          <RunAgentButton
            agent="orchestrator"
            kind="full_review"
            label="Run production cycle"
            compact
            prompt={`Run one full content production cycle for ${url}. Batch the work, keep me posted on progress, and route all site changes through pull requests on ${repo}.`}
          />
        </div>
      </PageHeader>

      <DemoBanner demo={demo} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="panel p-4 lg:col-span-2">
          <h2 className="mb-2 px-2 pt-2 text-sm font-semibold">Current optimization plan</h2>
          <Plan seedTasks={seoPlan} />
        </section>

        <section className="panel p-6">
          <h2 className="mb-4 text-sm font-semibold">Content run history</h2>
          <ul className="divide-y divide-edge">
            {contentRuns.length === 0 && (
              <li className="py-3 text-xs text-fg-faint">No content runs yet.</li>
            )}
            {contentRuns.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 py-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary" aria-hidden />
                  <span className="flex-1 text-xs font-medium">{r.agent_name}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-fg-mute">{r.summary ?? r.kind}</p>
                <p className="text-[11px] text-fg-faint">
                  {timeAgo(r.created_at)}{" "}
                  <Link href={`/dashboard/runs/${r.id}`} className="text-primary hover:underline">
                    read findings →
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
