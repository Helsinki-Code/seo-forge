"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DiffOp = { type: "context" | "remove" | "add"; text: string };

function lineDiff(oldText: string, newText: string): DiffOp[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      ops.push({ type: "context", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "remove", text: a[i] });
      i++;
    } else {
      ops.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < m) {
    ops.push({ type: "remove", text: a[i] });
    i++;
  }
  while (j < n) {
    ops.push({ type: "add", text: b[j] });
    j++;
  }
  return ops;
}

/** Parses a unified-diff hunk (e.g. "@@ -12,7 +12,10 @@\n-old\n+new\n context")
 * directly into DiffOps — used when the source already provides a patch
 * string instead of full before/after file contents (verified live: the
 * Site Experience Engineer's ImplementationProposal emits `diff.files[].patch`
 * in this format, not oldContent/newContent). */
function parsePatch(patch: string): DiffOp[] {
  const ops: DiffOp[] = [];
  for (const line of patch.split("\n")) {
    if (line.startsWith("@@") || line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) ops.push({ type: "add", text: line.slice(1) });
    else if (line.startsWith("-")) ops.push({ type: "remove", text: line.slice(1) });
    else ops.push({ type: "context", text: line.startsWith(" ") ? line.slice(1) : line });
  }
  return ops;
}

function countDiffStats(ops: DiffOp[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.type === "add") added++;
    else if (op.type === "remove") removed++;
  }
  return { added, removed };
}

type ApprovalDecision = "approved" | "rejected" | null;

function ApprovalFooter({
  isPending,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  onApprove,
  onReject,
}: {
  isPending: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const [decision, setDecision] = React.useState<ApprovalDecision>(null);
  const handleApprove = () => {
    setDecision("approved");
    onApprove?.();
  };
  const handleReject = () => {
    setDecision("rejected");
    onReject?.();
  };

  let status: string | null = null;
  if (decision === "approved") status = isPending ? "Starting" : "Approved";
  else if (decision === "rejected") status = "Canceled";
  else if (isPending) status = "Waiting";

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-2.5 py-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {status ?? ""}
        {decision === "approved" && isPending && (
          <span className="inline-flex gap-0.5">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse [animation-delay:0.2s]">.</span>
            <span className="animate-pulse [animation-delay:0.4s]">.</span>
          </span>
        )}
      </span>
      {decision === null && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReject}
            className="h-7 rounded-md border border-border px-2 text-xs font-medium text-foreground/80 hover:bg-muted"
          >
            {rejectLabel}
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="h-7 rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            {approveLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export type EditToolApproval = {
  approveLabel?: string;
  rejectLabel?: string;
  onApprove?: () => void;
  onReject?: () => void;
};

export type EditToolProps = {
  /** "completed" → past-tense label + full diff; "pending" → shimmer "Editing X" + diff; "waiting" → "Generating..." shimmer (no body, no diff). */
  state?: "completed" | "pending" | "waiting";
  /** "edit" (default) → "Edited"/"Editing"; "write" → "Created"/"Creating" (no removed lines). */
  variant?: "edit" | "write";
  /** Path is shown by basename in the header. Omit to render no filename. */
  filePath?: string;
  /** Old file contents — required for "edit" variant; ignored for "write". */
  oldContent?: string;
  /** New file contents — both variants. */
  newContent?: string;
  /** A pre-computed unified-diff hunk string. Takes priority over
   * oldContent/newContent when present — use this when the source only
   * provides a patch, not full file contents. */
  patch?: string;
  /** Approval footer. Pass to render Apply/Skip-style buttons under the diff. */
  approval?: EditToolApproval;
  className?: string;
};

export const EditTool = React.memo(function EditTool({
  state = "completed",
  variant = "edit",
  filePath,
  oldContent,
  newContent,
  patch,
  approval,
  className,
}: EditToolProps) {
  const isPending = state === "pending";
  const isWaiting = state === "waiting";
  const isWrite = variant === "write";
  const fileName = filePath?.split("/").pop() ?? undefined;

  const diffOps = React.useMemo<DiffOp[] | null>(() => {
    if (isWaiting) return null;
    if (patch) {
      return parsePatch(patch);
    }
    if (isWrite && newContent) {
      return newContent.split("\n").map((text) => ({ type: "add" as const, text }));
    }
    if (oldContent !== undefined && newContent !== undefined) {
      return lineDiff(oldContent, newContent);
    }
    return null;
  }, [isWaiting, isWrite, oldContent, newContent, patch]);

  const stats = React.useMemo(() => (diffOps ? countDiffStats(diffOps) : null), [diffOps]);

  const headerLabel = isWaiting
    ? "Generating…"
    : isPending
      ? `${isWrite ? "Creating" : "Editing"}${fileName ? ` ${fileName}` : ""}`
      : `${isWrite ? "Created" : "Edited"}${fileName ? ` ${fileName}` : ""}`;

  return (
    <div className={cn("w-full overflow-hidden rounded-[10px] border border-border bg-card", className)}>
      <div
        className={cn(
          "flex h-7 items-center justify-between bg-muted/50 px-2.5",
          (diffOps && diffOps.length > 0) || approval ? "border-b border-border" : "",
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "truncate text-xs",
              isPending || isWaiting ? "animate-pulse text-muted-foreground" : "text-muted-foreground",
            )}
          >
            {headerLabel}
          </span>
        </div>
        {stats && !isPending && !isWaiting && (stats.added > 0 || stats.removed > 0) && (
          <span className="inline-flex shrink-0 gap-2 font-mono text-[11px] text-muted-foreground">
            {stats.added > 0 && <span className="text-mint">+{stats.added}</span>}
            {stats.removed > 0 && <span className="text-rose">-{stats.removed}</span>}
          </span>
        )}
      </div>
      {diffOps && diffOps.length > 0 && (
        <div className="overflow-x-auto bg-background font-mono text-[12px] leading-[1.5]">
          {diffOps.map((op, i) => (
            <div
              key={i}
              className={cn(
                "flex min-w-0 items-start",
                op.type === "add" && "bg-mint/10 text-mint",
                op.type === "remove" && "bg-rose/10 text-rose",
                op.type === "context" && "text-foreground/80",
              )}
            >
              <span
                className={cn(
                  "w-4 shrink-0 select-none text-center",
                  op.type === "add" && "text-mint",
                  op.type === "remove" && "text-rose",
                  op.type === "context" && "text-muted-foreground",
                )}
              >
                {op.type === "add" ? "+" : op.type === "remove" ? "-" : " "}
              </span>
              <span className="min-w-0 flex-1 whitespace-pre pr-2">{op.text || " "}</span>
            </div>
          ))}
        </div>
      )}
      {approval && (
        <ApprovalFooter
          isPending={isPending}
          approveLabel={approval.approveLabel}
          rejectLabel={approval.rejectLabel}
          onApprove={approval.onApprove}
          onReject={approval.onReject}
        />
      )}
    </div>
  );
});
