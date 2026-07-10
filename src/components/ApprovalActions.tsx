"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

export default function ApprovalActions({
  approvalId,
  prNumber,
  title,
}: {
  approvalId?: string;
  prNumber?: number;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function decide(action: "approve" | "reject") {
    setBusy(action);
    setError("");
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, approvalId, prNumber, title }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "failed");
      setDone(json.status);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (done) {
    return <span className="text-xs font-medium text-mint">{done} ✓</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => decide("approve")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-mint/15 px-3 py-1.5 text-xs font-medium text-mint transition-colors duration-200 hover:bg-mint/25 disabled:opacity-50"
        >
          {busy === "approve" ? (
            <Loader2 size={13} className="animate-spin" aria-hidden />
          ) : (
            <Check size={13} aria-hidden />
          )}
          {prNumber ? "Approve & merge" : "Approve"}
        </button>
        <button
          onClick={() => decide("reject")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose/15 px-3 py-1.5 text-xs font-medium text-rose transition-colors duration-200 hover:bg-rose/25 disabled:opacity-50"
        >
          {busy === "reject" ? (
            <Loader2 size={13} className="animate-spin" aria-hidden />
          ) : (
            <X size={13} aria-hidden />
          )}
          Reject
        </button>
      </div>
      {error && <p className="max-w-64 text-right text-xs text-rose">{error}</p>}
    </div>
  );
}
