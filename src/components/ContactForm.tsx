"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "failed");
      setMsg({ ok: true, text: "Message received — we'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to send" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel flex flex-col gap-4 p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-name" className="text-xs text-fg-mute">
            Name
          </label>
          <input
            id="c-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-primary"
            placeholder="Your name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-email" className="text-xs text-fg-mute">
            Email
          </label>
          <input
            id="c-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-primary"
            placeholder="you@company.com"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-message" className="text-xs text-fg-mute">
          Message
        </label>
        <textarea
          id="c-message"
          required
          minLength={10}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-primary"
          placeholder="Tell us about your site and what you want to rank for…"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dim disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={15} className="animate-spin" aria-hidden />
        ) : (
          <Send size={15} aria-hidden />
        )}
        {busy ? "Sending…" : "Send message"}
      </button>
      {msg && (
        <p className={`text-xs ${msg.ok ? "text-mint" : "text-rose"}`} role="status">
          {msg.text}
        </p>
      )}
    </form>
  );
}
