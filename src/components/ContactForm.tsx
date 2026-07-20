"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const initial = { name: "", email: "", website: "", sites: "1", objective: "", message: "" };

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState(initial);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "The request could not be sent.");
      setMsg({ ok: true, text: "Received. We’ll review your website and reply with the appropriate next step." });
      setForm(initial);
    } catch (error) {
      setMsg({ ok: false, text: error instanceof Error ? error.message : "The request could not be sent." });
    } finally { setBusy(false); }
  }

  const field = "w-full rounded-xl border border-edge bg-panel-2 px-3.5 py-3 text-sm text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
  return (
    <form onSubmit={submit} className="space-y-5" aria-label="SEOForge consultation request">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-fg-mute">Name<input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${field} mt-2`} placeholder="Your name" /></label>
        <label className="text-xs font-medium text-fg-mute">Work email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${field} mt-2`} placeholder="you@company.com" /></label>
      </div>
      <label className="block text-xs font-medium text-fg-mute">Website<input required type="url" inputMode="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={`${field} mt-2`} placeholder="https://example.com" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-fg-mute">Number of websites<select value={form.sites} onChange={(e) => setForm({ ...form, sites: e.target.value })} className={`${field} mt-2`}><option>1</option><option>2–5</option><option>6–25</option><option>26+</option></select></label>
        <label className="text-xs font-medium text-fg-mute">Primary objective<select required value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} className={`${field} mt-2`}><option value="" disabled>Select one</option><option>Build a new content engine</option><option>Grow existing organic traffic</option><option>Recover lost rankings</option><option>Run an agency portfolio</option><option>Evaluate security and workflow</option></select></label>
      </div>
      <label className="block text-xs font-medium text-fg-mute">Anything we should know? <span className="text-fg-faint">Optional</span><textarea rows={4} maxLength={2500} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${field} mt-2 resize-y`} placeholder="Markets, CMS or repository setup, publishing volume, approval requirements…" /></label>
      <button type="submit" disabled={busy} className="marketing-button marketing-button-primary w-full justify-center sm:w-auto">{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}{busy ? "Sending…" : "Request a conversation"}</button>
      {msg ? <p className={`flex items-start gap-2 rounded-xl border p-4 text-sm ${msg.ok ? "border-mint/25 bg-mint/5 text-mint" : "border-rose/25 bg-rose/5 text-rose"}`} role="status">{msg.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : null}{msg.text}</p> : null}
      <p className="text-[11px] leading-5 text-fg-faint">This is a paid product consultation, not a free audit or trial request. Submitting does not grant SEOForge access to your website.</p>
    </form>
  );
}
