"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Loader2 } from "lucide-react";

export default function SyncBranchesButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function sync() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "failed");
      const n = json.created?.length ?? 0;
      setMsg(n > 0 ? `Opened ${n} PR${n > 1 ? "s" : ""} from agent branches` : "No new agent branches found");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={sync}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg border border-edge bg-panel px-3.5 py-2 text-sm text-fg transition-colors duration-200 hover:border-edge-2 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={15} className="animate-spin" aria-hidden />
        ) : (
          <GitBranch size={15} aria-hidden />
        )}
        {busy ? "Scanning…" : "Scan agent branches"}
      </button>
      {msg && <p className="text-xs text-fg-mute">{msg}</p>}
    </div>
  );
}
