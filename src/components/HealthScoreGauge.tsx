import { CircleProgress } from "@/components/ui/circle-progress";
import { timeAgo } from "@/components/ui";
import { HEALTH_CATEGORIES, type HealthCategory } from "@/lib/data";

const CATEGORY_LABEL: Record<HealthCategory, string> = {
  technical: "Technical",
  content: "Content",
  links: "Links",
  performance: "Performance",
  geo: "GEO / AI citation",
};

function barColor(score: number) {
  if (score >= 70) return "bg-mint";
  if (score >= 40) return "bg-amber";
  return "bg-rose";
}

export default function HealthScoreGauge({
  overall,
  categoryScores,
  computedAt,
}: {
  overall: number;
  categoryScores: Record<string, number>;
  computedAt: string | null;
}) {
  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">SEO Health Score</h2>
        <span className="text-[11px] text-fg-faint">
          {computedAt ? `computed ${timeAgo(computedAt)}` : "live — derived from open findings"}
        </span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
          <CircleProgress value={overall} maxValue={100} size={120} strokeWidth={9} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="display text-2xl font-semibold">{overall}</span>
            <span className="text-[10px] text-fg-faint">/ 100</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {HEALTH_CATEGORIES.map((cat) => {
            const score = categoryScores[cat] ?? 100;
            return (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-fg-mute">{CATEGORY_LABEL[cat]}</span>
                  <span className="font-medium text-fg">{score}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(score)}`}
                    style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
