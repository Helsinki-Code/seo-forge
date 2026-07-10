"use client";

import { useState } from "react";
import { Loader2, Play, ExternalLink } from "lucide-react";

export default function RunAgentButton({
  agent,
  kind,
  prompt,
  label,
  compact = false,
}: {
  agent: string;
  kind: string;
  prompt: string;
  label: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [detail, setDetail] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  async function run() {
    setState("loading");
    setDetail("");
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, kind, prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "failed");
      setUrl(json.consoleUrl ?? "");
      setDetail(`Session ${json.sessionId?.slice(0, 14)}… started`);
      setState("done");
    } catch (e) {
      setDetail(e instanceof Error ? e.message : "Failed to start agent");
      setState("error");
    }
  }

  return (
    <div className={compact ? "inline-flex items-center gap-2" : "flex flex-col gap-2"}>
      <button
        onClick={run}
        disabled={state === "loading"}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim disabled:opacity-50"
      >
        {state === "loading" ? (
          <Loader2 size={15} className="animate-spin" aria-hidden />
        ) : (
          <Play size={15} aria-hidden />
        )}
        {state === "loading" ? "Starting…" : label}
      </button>
      {detail && (
        <p className={`text-xs ${state === "error" ? "text-rose" : "text-mint"}`}>
          {detail}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
            >
              watch live <ExternalLink size={11} aria-hidden />
            </a>
          )}
        </p>
      )}
    </div>
  );
}
