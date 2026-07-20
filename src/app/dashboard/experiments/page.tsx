import { auth } from "@clerk/nextjs/server";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import ConnectPrompt from "@/components/ConnectPrompt";
import { getUserSite, getExperiments } from "@/lib/data";
import { FlaskConical } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;

  const { data: experiments } = await getExperiments(site.id);

  return (
    <>
      <PageHeader
        title="Experiments"
        subtitle="Hypotheses raised by the Search Optimization Agent — one primary metric, a precommitted observation window, and a keep/iterate/revert outcome."
      />
      <DemoBanner demo={demo} />

      <section className="panel p-6">
        {experiments.length === 0 ? (
          <p className="text-sm text-fg-faint">No experiments yet.</p>
        ) : (
          <ul className="divide-y divide-edge">
            {experiments.map((e) => (
              <li key={e.id} className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <FlaskConical size={14} className="text-primary" aria-hidden />
                  <span className="text-sm font-medium">{e.hypothesis}</span>
                  <StatusBadge status={e.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-mute">
                  <span>
                    Primary metric: <span className="text-fg">{e.primary_metric}</span>
                  </span>
                  {e.secondary_metrics.length > 0 && (
                    <span>Secondary: {e.secondary_metrics.join(", ")}</span>
                  )}
                  {e.observation_window && <span>Window: {e.observation_window}</span>}
                </div>
                <p className="text-[11px] text-fg-faint">
                  {e.started_at ? `started ${timeAgo(e.started_at)}` : `created ${timeAgo(e.created_at)}`}
                  {e.decided_at ? ` · decided ${timeAgo(e.decided_at)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
