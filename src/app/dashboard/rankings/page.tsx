import { DemoBanner, PageHeader, timeAgo } from "@/components/ui";
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
import { getKeywords, getSite, getSnapshots } from "@/lib/data";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const { data: site } = await getSite();
  const { data: keywords, demo } = await getKeywords(site?.id ?? "demo");
  const { data: snapshots } = await getSnapshots(keywords.map((k) => k.id));

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
        title="Rankings"
        subtitle="SERP positions tracked over time — every optimization measured.">
        <div className="flex flex-wrap items-center gap-3">
          <AddKeywordForm />
          <RunAgentButton
            agent="strategist"
            kind="serp_check"
            label="Run SERP sweep"
            compact
            prompt={`Run a fresh SERP check for these keywords of ${site?.url ?? "https://seoforge.online"}: ${keywords
              .map((k) => k.keyword)
              .join(", ")}. For each: current top-10, our position if visible, SERP features, and any title/meta rewrite opportunity. Summarize movements clearly.`}
          />
        </div>
      </PageHeader>

      <DemoBanner demo={demo} />

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
