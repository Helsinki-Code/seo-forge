import { AiSkeleton } from "@/components/ui/ai-agent-processing-states";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-panel-2" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel h-28 animate-pulse" />
        ))}
      </div>
      <div className="panel p-6">
        <AiSkeleton />
      </div>
    </div>
  );
}
