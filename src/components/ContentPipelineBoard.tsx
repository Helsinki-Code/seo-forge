import { timeAgo } from "@/components/ui";
import { CONTENT_STAGES, type ContentItem, type ContentStage } from "@/lib/data";

const STAGE_LABEL: Record<ContentStage, string> = {
  brief: "Brief",
  drafting: "Drafting",
  editorial_review: "Editorial review",
  publishing_ready: "Publishing ready",
  published: "Published",
  measuring: "Measuring",
};

export default function ContentPipelineBoard({ items }: { items: ContentItem[] }) {
  const byStage = new Map<ContentStage, ContentItem[]>();
  for (const stage of CONTENT_STAGES) byStage.set(stage, []);
  for (const item of items) byStage.get(item.stage)?.push(item);

  return (
    <div className="overflow-x-auto">
      <div className="grid auto-cols-[minmax(180px,1fr)] grid-flow-col gap-3">
        {CONTENT_STAGES.map((stage) => {
          const stageItems = byStage.get(stage) ?? [];
          return (
            <div key={stage} className="flex min-h-40 flex-col gap-2 rounded-md border border-edge bg-panel-2 p-2">
              <div className="flex items-center gap-2 px-1 py-1">
                <p className="m-0 text-sm font-semibold">{STAGE_LABEL[stage]}</p>
                <span className="ml-auto text-[11px] text-fg-faint">{stageItems.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {stageItems.map((item) => (
                  <div key={item.id} className="rounded-md border border-edge bg-panel p-2.5 text-xs">
                    <p className="m-0 line-clamp-2 font-medium text-fg">{item.title ?? item.asset_id}</p>
                    {item.target_keyword && (
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-fg-mute">{item.target_keyword}</p>
                    )}
                    <p className="mt-1 text-[10px] text-fg-faint">updated {timeAgo(item.updated_at)}</p>
                  </div>
                ))}
                {stageItems.length === 0 && (
                  <p className="px-1 py-3 text-center text-[11px] text-fg-faint">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
