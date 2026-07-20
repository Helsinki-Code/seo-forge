import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import RankChart, { RankPoint } from "@/components/RankChart";
import RunAgentButton from "@/components/RunAgentButton";
import AddKeywordForm from "@/components/AddKeywordForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@clerk/nextjs/server";
import ConnectPrompt from "@/components/ConnectPrompt";
import {
  getAiCitationObservations,
  getCompetitorObservations,
  getKeywords,
  getOptimizationPipeline,
  getSnapshots,
  getUserSite,
  OPTIMIZATION_STAGES,
  type OptimizationStage,
} from "@/lib/data";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<OptimizationStage, string> = {
  detected: "Detected",
  investigated: "Investigated",
  proposal_prepared: "Proposal prepared",
  approved: "Approved",
  deployed: "Deployed",
  measuring: "Measuring",
  measured: "Measured",
};

export default async function RankingsPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;
  const { data: keywords } = await getKeywords(site.id);
  const { data: snapshots } = await getSnapshots(keywords.map((k) => k.id));
  const { data: pipeline } = await getOptimizationPipeline(site.id);
  const { data: competitors } = await getCompetitorObservations(site.id, 10);
  const { data: citations } = await getAiCitationObservations(site.id, 10);

  const byStage = new Map<OptimizationStage, typeof pipeline>();
  for (const stage of OPTIMIZATION_STAGES) byStage.set(stage, []);
  for (const item of pipeline) byStage.get(item.stage)?.push(item);

  const series = new Map<string, { position: number | null; checked_at: string }[]>();
  for (const s of snapshots) {
    const arr = series.get(s.keyword_id) ?? [];
    arr.push({ position: s.position, checked_at: s.checked_at });
    series.set(s.keyword_id, arr);
  }

  const chartKeywords = keywords.slice(0, 5);
  const byDate = new Map<string, RankPoint>();
  for (const s of snapshots) {
    const kw = chartKeywords.find((k) => k.id === s.keyword_id);
    if (!kw) continue;
    const date = s.checked_at.slice(5, 10);
    const row = byDate.get(date) ?? { date };
    row[kw.keyword] = s.position;
    byDate.set(date, row);
  }

  return (
    <>
      <PageHeader
        title="Search Optimization"
        subtitle="Crawls and monitors existing pages: rankings, technical SEO, decay, cannibalization, links, performance, GEO.">
        <div className="flex flex-wrap items-center gap-3">
          <AddKeywordForm />
          <RunAgentButton
            agent="searchOptimization"
            kind="serp_check"
            label="Run SERP sweep"
            compact
            prompt={`Run a fresh SERP check for these keywords of ${site.url}: ${keywords
              .map((k) => k.keyword)
              .join(", ")}. For each: current top-10, our position if visible, SERP features, and any title/meta rewrite opportunity. Summarize movements clearly.`}
          />
        </div>
      </PageHeader>

      <DemoBanner demo={demo} />

      <section className="panel mb-6 overflow-x-auto p-4">
        <h2 className="mb-3 px-2 text-sm font-semibold">Optimization pipeline</h2>
        <div className="grid auto-cols-[minmax(180px,1fr)] grid-flow-col gap-3">
          {OPTIMIZATION_STAGES.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <div key={stage} className="flex min-h-40 flex-col gap-2 rounded-md border border-edge bg-panel-2 p-2">
                <div className="flex items-center gap-2 px-1 py-1">
                  <p className="m-0 text-sm font-semibold">{STAGE_LABEL[stage]}</p>
                  <span className="ml-auto text-[11px] text-fg-faint">{items.length}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-md border border-edge bg-panel p-2.5 text-xs">
                      <p className="m-0 line-clamp-2 font-medium text-fg">{item.title}</p>
                      {item.experiment && (
                        <StatusBadge status={item.experiment.status} />
                      )}
                      <p className="mt-1 text-[10px] text-fg-faint">{timeAgo(item.created_at)}</p>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="px-1 py-3 text-center text-[11px] text-fg-faint">Nothing here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {(competitors.length > 0 || citations.length > 0) && (
        <section className="panel mb-6 p-6">
          <h2 className="mb-4 text-sm font-semibold">Competitive & AI visibility</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-fg-mute">Competitor observations</p>
              {competitors.length === 0 && <p className="text-xs text-fg-faint">None yet.</p>}
              <ul className="space-y-1.5">
                {competitors.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate text-fg-mute">
                      {c.competitor_domain}
                      {c.keyword ? ` · ${c.keyword}` : ""} · {c.metric}
                    </span>
                    <span className="shrink-0 text-fg-faint">{timeAgo(c.captured_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-fg-mute">AI citation probes</p>
              {citations.length === 0 && <p className="text-xs text-fg-faint">None yet.</p>}
              <ul className="space-y-1.5">
                {citations.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate text-fg-mute">
                      {c.engine} · &ldquo;{c.query}&rdquo; · {c.cited ? "cited" : "not cited"}
                      {c.is_synthetic_probe ? " (synthetic probe)" : ""}
                    </span>
                    <span className="shrink-0 text-fg-faint">{timeAgo(c.captured_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="panel mb-6 p-6">
        <h2 className="mb-4 text-sm font-semibold">Position history (top 5 keywords)</h2>
        <RankChart points={[...byDate.values()]} keywords={chartKeywords.map((k) => k.keyword)} />
      </section>

      <section className="panel overflow-x-auto p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead>Target URL</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Last checked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((k) => {
              const s = series.get(k.id) ?? [];
              const latest = s[s.length - 1];
              const prev = s[s.length - 2];
              const delta =
                latest?.position != null && prev?.position != null
                  ? prev.position - latest.position
                  : 0;
              return (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.keyword}</TableCell>
                  <TableCell className="text-fg-mute">{k.target_url ?? "—"}</TableCell>
                  <TableCell>
                    <span className={k.priority === 1 ? "text-amber" : "text-fg-mute"}>
                      P{k.priority}
                    </span>
                  </TableCell>
                  <TableCell className="display font-semibold text-primary">
                    {latest?.position != null ? `#${latest.position}` : "—"}
                  </TableCell>
                  <TableCell>
                    {delta > 0 ? (
                      <span className="inline-flex items-center gap-1 text-mint">
                        <ArrowUpRight size={14} aria-hidden /> +{delta}
                      </span>
                    ) : delta < 0 ? (
                      <span className="inline-flex items-center gap-1 text-rose">
                        <ArrowDownRight size={14} aria-hidden /> {delta}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-fg-faint">
                        <Minus size={14} aria-hidden /> 0
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-fg-faint">
                    {latest ? timeAgo(latest.checked_at) : "never"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
