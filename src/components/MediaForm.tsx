"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";

export default function MediaForm() {
  const [articleUrl, setArticleUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; url?: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleUrl, notes: notes || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "failed");
      setMsg({
        ok: true,
        text: "Image Generator dispatched — it will study the article's tone and style first.",
        url: json.consoleUrl,
      });
      setArticleUrl("");
      setNotes("");
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to start" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel flex flex-col gap-3 p-6">
      <h2 className="text-sm font-semibold">Generate media for an article</h2>
      <p className="text-xs text-fg-mute">
        The agent reads the article, matches its tone and visual style, and produces a hero
        image plus in-content assets with SEO alt text.
      </p>
      <label htmlFor="article-url" className="text-xs text-fg-mute">
        Article URL
      </label>
      <input
        id="article-url"
        required
        value={articleUrl}
        onChange={(e) => setArticleUrl(e.target.value)}
        placeholder="https://seoforge.online/blog/your-article"
        className="rounded-lg border border-edge bg-panel-2 px-3 py-2 text-sm text-fg placeholder:text-fg-faint focus:border-primary"
      />
      <label htmlFor="media-notes" className="text-xs text-fg-mute">
        Art direction (optional)
      </label>
      <textarea
        id="media-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="e.g. keep the dark editorial style, add one comparison diagram"
        className="rounded-lg border border-edge bg-panel-2 px-3 py-2 text-sm text-fg placeholder:text-fg-faint focus:border-primary"
      />
      <button
        type="submit"
        disabled={busy}
        className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={15} className="animate-spin" aria-hidden />
        ) : (
          <Sparkles size={15} aria-hidden />
        )}
        {busy ? "Dispatching…" : "Generate media"}
      </button>
      {msg && (
        <p className={`text-xs ${msg.ok ? "text-mint" : "text-rose"}`}>
          {msg.text}
          {msg.url && (
            <a
              href={msg.url}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
            >
              watch live <ExternalLink size={11} aria-hidden />
            </a>
          )}
        </p>
      )}
    </form>
  );
}
