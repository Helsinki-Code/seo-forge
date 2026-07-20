"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarIndicator, AvatarStatus } from "@/components/ui/avatar";
import { AiLoader } from "@/components/ui/ai-agent-processing-states";
import { timeAgo } from "@/components/ui";
import type { ThreadActivity } from "@/lib/agents";

const SHORT_NAME: Record<string, string> = {
  "SEOForge Workflow Supervisor": "Supervisor",
  "SEOForge Content Growth Agent": "Content Growth",
  "SEOForge Search Optimization Agent": "Search Optimization",
  "SEOForge Site Experience Engineer": "Site Experience",
};

function initialsOf(name: string): string {
  const short = SHORT_NAME[name] ?? name;
  return short
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Polls per-agent-thread status for a run while it's active. Backed by
 * real `session.thread_status_*` events (via /api/agents/runs/[id]/activity),
 * not a synthetic progress indicator — an empty list just means no thread
 * has reported yet, not that nothing is happening.
 */
export default function LiveAgentActivity({ runId, isRunning }: { runId: string; isRunning: boolean }) {
  const [threads, setThreads] = useState<ThreadActivity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/agents/runs/${runId}/activity`, { cache: "no-store" });
        if (!res.ok) return;
        const { threads: next } = (await res.json()) as { threads: ThreadActivity[] };
        if (!cancelled) {
          setThreads(next);
          setLoaded(true);
        }
      } catch {
        // best-effort — next poll will retry
      }
    }
    poll();
    if (!isRunning) return;
    const interval = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [runId, isRunning]);

  if (!loaded) return null;
  if (threads.length === 0) {
    return isRunning ? (
      <div className="mb-4">
        <AiLoader variant="dots" text="Waiting for the first agent thread to report…" />
      </div>
    ) : null;
  }

  return (
    <div className="mb-6 space-y-2">
      <p className="text-xs uppercase tracking-wider text-fg-faint">Live agent activity</p>
      <div className="flex flex-wrap gap-3">
        {threads.map((t) => (
          <div
            key={t.threadId}
            className="flex items-center gap-2.5 rounded-lg border border-edge bg-panel-2 px-3 py-2"
          >
            <Avatar className="size-8">
              <AvatarFallback>{initialsOf(t.agentName)}</AvatarFallback>
              <AvatarIndicator className="bottom-0 right-0">
                <AvatarStatus variant={t.status === "running" ? "online" : "offline"} />
              </AvatarIndicator>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-fg">{SHORT_NAME[t.agentName] ?? t.agentName}</span>
              <span className="text-[11px] text-fg-faint">
                {t.status === "running" ? "working" : "idle"} · {timeAgo(t.lastEventAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
