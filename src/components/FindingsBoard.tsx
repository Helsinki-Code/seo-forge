"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DragEndEvent } from "@dnd-kit/core";
import { KanbanBoard, KanbanCard, KanbanCards, KanbanHeader, KanbanProvider } from "@/components/ui/kanban";
import { Badge } from "@/components/ui/badge-2";
import { timeAgo } from "@/components/ui";
import type { Finding } from "@/lib/data";

const COLUMNS = [
  { id: "open", name: "Open", color: "#3b82f6" },
  { id: "accepted", name: "Accepted", color: "#34d399" },
  { id: "deferred", name: "Deferred", color: "#f59e0b" },
  { id: "dismissed", name: "Dismissed", color: "#5c667e" },
] as const;

const STATUS_TO_ACTION: Record<string, string> = {
  open: "reopen",
  accepted: "accept",
  deferred: "defer",
  dismissed: "dismiss",
};

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
  critical: "destructive",
  high: "warning",
  medium: "info",
  low: "secondary",
};

export default function FindingsBoard({ initialFindings }: { initialFindings: Finding[] }) {
  const router = useRouter();
  const [findings, setFindings] = useState(initialFindings);
  const [, startTransition] = useTransition();

  const byColumn = useMemo(() => {
    const map = new Map<string, Finding[]>(COLUMNS.map((c) => [c.id, []]));
    for (const f of findings) {
      if (f.status === "duplicate") continue; // folded into its canonical finding, not a column
      map.get(f.status)?.push(f);
    }
    return map;
  }, [findings]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const targetColumn = COLUMNS.find((c) => c.id === over.id);
    if (!targetColumn) return;

    const finding = findings.find((f) => f.id === active.id);
    if (!finding || finding.status === targetColumn.id) return;

    const prev = findings;
    setFindings((fs) => fs.map((f) => (f.id === finding.id ? { ...f, status: targetColumn.id } : f)));

    startTransition(async () => {
      const res = await fetch("/api/findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: STATUS_TO_ACTION[targetColumn.id], findingIds: [finding.id] }),
      });
      if (!res.ok) {
        setFindings(prev); // revert on failure
      } else {
        router.refresh();
      }
    });
  }

  return (
    <KanbanProvider onDragEnd={handleDragEnd} className="min-h-[420px]">
      {COLUMNS.map((column) => {
        const items = byColumn.get(column.id) ?? [];
        return (
          <KanbanBoard key={column.id} id={column.id}>
            <KanbanHeader name={column.name} color={column.color} count={items.length} />
            <KanbanCards>
              {items.map((finding, index) => (
                <KanbanCard key={finding.id} id={finding.id} index={index} parent={column.id}>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="m-0 text-xs font-medium leading-snug text-foreground">{finding.title}</p>
                      <Badge
                        variant={SEVERITY_VARIANT[finding.severity] ?? "secondary"}
                        appearance="light"
                        size="xs"
                        className="shrink-0"
                      >
                        {finding.severity}
                      </Badge>
                    </div>
                    {finding.summary && (
                      <p className="m-0 line-clamp-2 text-[11px] text-muted-foreground">{finding.summary}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {finding.source_agent === "content_growth" ? "Content Growth" : "Search Optimization"}
                        {finding.category ? ` · ${finding.category}` : ""}
                      </span>
                      <span>{timeAgo(finding.created_at)}</span>
                    </div>
                  </div>
                </KanbanCard>
              ))}
              {items.length === 0 && (
                <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">Nothing here</p>
              )}
            </KanbanCards>
          </KanbanBoard>
        );
      })}
    </KanbanProvider>
  );
}
