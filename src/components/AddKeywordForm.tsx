"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

export default function AddKeywordForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, targetUrl: targetUrl || undefined, priority: 3 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "failed");
      setKeyword("");
      setTargetUrl("");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add keyword");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-edge bg-panel px-3.5 py-2 text-sm text-fg transition-colors duration-200 hover:border-edge-2"
      >
        <Plus size={15} aria-hidden /> Add keyword
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <label htmlFor="kw" className="sr-only">
        Keyword
      </label>
      <input
        id="kw"
        required
        minLength={2}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="keyword to track"
        className="rounded-lg border border-edge bg-panel-2 px-3 py-2 text-sm text-fg placeholder:text-fg-faint focus:border-primary"
      />
      <label htmlFor="turl" className="sr-only">
        Target URL
      </label>
      <input
        id="turl"
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        placeholder="/target-page (optional)"
        className="rounded-lg border border-edge bg-panel-2 px-3 py-2 text-sm text-fg placeholder:text-fg-faint focus:border-primary"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim disabled:opacity-50"
      >
        {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Plus size={15} aria-hidden />}
        Save
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-2 text-sm text-fg-mute hover:text-fg"
      >
        Cancel
      </button>
      {error && <p className="w-full text-xs text-rose">{error}</p>}
    </form>
  );
}
