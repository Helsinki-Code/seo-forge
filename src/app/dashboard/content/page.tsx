import Link from "next/link";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import RunAgentButton from "@/components/RunAgentButton";
import ContentPipelineBoard from "@/components/ContentPipelineBoard";
import { auth } from "@clerk/nextjs/server";
import ConnectPrompt from "@/components/ConnectPrompt";
import { getContentPipeline, getRuns, getUserSite } from "@/lib/data";
import { CalendarDays, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;
  const { data: runs } = await getRuns(site.id, 30);
  const { data: pipeline } = await getContentPipeline(site.id);
  const contentRuns = runs.filter((r) => ["content", "media", "full_review"].includes(r.kind));
  const url = site.url;
  const repo = site.github_repo ?? site.url;

  const scheduled = pipeline
    .filter((i) => i.scheduled_date)
    .sort((a, b) => (a.scheduled_date! < b.scheduled_date! ? -1 : 1));

  return (
    <>
      <PageHeader
        title="Content Growth"
        subtitle="Researches opportunities, maintains the calendar, and hands finished work to the Site Experience Engineer."
      >
        <div className="flex flex-wrap gap-3">
          <RunAgentButton
            agent="contentGrowth"
            kind="content"
            label="Refresh weakest article"
            compact
            prompt={`Identify the weakest-performing article on ${url} from the latest strategy output and rewrite it completely: verified external links, internal links from the site architecture, image prompts with alt text. Hand the finished draft to the Site Experience Engineer as a ContentPublishingRequest for ${repo}.`}
          />
          <RunAgentButton
            agent="supervisor"
            kind="full_review"
            label="Run production cycle"
            compact
            prompt={`Run one full content production cycle for ${url}. Batch the work, keep me posted on progress, and route all site changes through pull requests on ${repo}.`}
          />
        </div>
      </PageHeader>

      <DemoBanner demo={demo} />

      {scheduled.length > 0 && (
        <section className="panel mb-6 p-6">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" aria-hidden />
            <h2 className="text-sm font-semibold">Editorial calendar</h2>
          </div>
          <ul className="divide-y divide-edge">
            {scheduled.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 py-2 text-xs">
                <span className="display font-semibold text-primary">
                  {new Date(item.scheduled_date!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <span className="min-w-0 flex-1 truncate text-fg-mute">{item.title ?? item.asset_id}</span>
                <span className="text-fg-faint">{item.stage.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="panel p-4 lg:col-span-2">
          <h2 className="mb-2 px-2 pt-2 text-sm font-semibold">Content pipeline</h2>
          <ContentPipelineBoard items={pipeline} />
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
