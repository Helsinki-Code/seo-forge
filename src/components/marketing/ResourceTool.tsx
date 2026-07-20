"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ResourceTool({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setResult(Boolean(input.trim())); }
  return (
    <div className="rounded-2xl border border-edge bg-panel p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">Public interactive preview</p>
      <h2 className="mt-3 text-2xl font-semibold">Run the {title.toLowerCase()}</h2>
      <p className="mt-3 text-sm leading-6 text-fg-mute">Get a useful readiness result without entering an email. Saving, monitoring or implementing requires a paid SEOForge workspace.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="tool-url">Website URL</label><input id="tool-url" value={input} onChange={(e) => setInput(e.target.value)} type="url" required placeholder="https://example.com" className="min-h-11 flex-1 rounded-lg border border-edge bg-ink px-4 text-sm outline-none focus:border-primary" /><button className="marketing-button marketing-button-primary sm:w-auto">Run readiness check <ArrowRight size={15} /></button></form>
      {result ? <div className="mt-6 rounded-xl border border-mint/25 bg-mint/7 p-5"><p className="flex items-center gap-2 text-sm font-semibold text-mint"><CheckCircle2 size={17} />Input accepted for this product demonstration</p><p className="mt-2 text-sm leading-6 text-fg-mute">A production result would require a safe crawl, provider evidence and a timestamp. This preview deliberately does not fabricate a score for {input}.</p></div> : null}
    </div>
  );
}
