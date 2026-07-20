"use client";

import { useState } from "react";
import { Check, FileCode2, RotateCcw, ShieldCheck, X } from "lucide-react";

const files = [
  { name: "app/blog/seo-operations/page.mdx", additions: 46, deletions: 8 },
  { name: "public/media/seo-operations-diagram.webp", additions: 1, deletions: 0 },
  { name: "app/sitemap.ts", additions: 3, deletions: 1 },
];

export default function ApprovalSandbox() {
  const [active, setActive] = useState(0);
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected">("pending");
  return (
    <div className="overflow-hidden rounded-2xl border border-edge bg-[#080a0f] shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-5 py-4">
        <div><p className="text-[10px] uppercase tracking-[.18em] text-fg-faint">Interactive demonstration</p><p className="mt-1 text-sm font-semibold">Proposal SF-1842 · Content opportunity</p></div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] ${decision === "approved" ? "bg-mint/12 text-mint" : decision === "rejected" ? "bg-rose/12 text-rose" : "bg-amber/12 text-amber"}`}>{decision}</span>
      </div>
      <div className="grid lg:grid-cols-[.42fr_.58fr]">
        <div className="border-b border-edge p-3 lg:border-b-0 lg:border-r">
          {files.map((file, index) => <button key={file.name} onClick={() => setActive(index)} className={`mb-1 w-full rounded-xl p-3 text-left transition ${active === index ? "bg-primary/10 text-fg" : "text-fg-mute hover:bg-panel"}`}><span className="flex items-center gap-2 text-xs"><FileCode2 size={14} className="text-primary" />{file.name}</span><span className="mt-2 block text-[10px]"><span className="text-mint">+{file.additions}</span> <span className="text-rose">-{file.deletions}</span></span></button>)}
        </div>
        <div className="p-5 font-mono text-[11px] leading-6">
          <p className="mb-3 text-fg-faint">@@ {files[active].name}</p>
          <p className="rounded bg-rose/8 px-2 text-rose">- Search automation publishes content automatically.</p>
          <p className="mt-1 rounded bg-mint/8 px-2 text-mint">+ SEOForge prepares evidence-backed work for explicit human approval.</p>
          <p className="mt-1 rounded bg-mint/8 px-2 text-mint">+ Production checks and rollback context remain attached.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">{["Sources verified", "Build passed", "Rollback ready"].map((check) => <span key={check} className="flex items-center gap-2 rounded-lg border border-edge bg-panel px-3 py-2 text-[10px] text-fg-mute"><Check size={12} className="text-mint" />{check}</span>)}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-edge p-4">
        <p className="flex items-center gap-2 text-[11px] text-fg-faint"><ShieldCheck size={14} className="text-amber" />Demo only—these controls cannot publish anything.</p>
        <div className="flex gap-2"><button onClick={() => setDecision("rejected")} className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-xs text-fg-mute hover:border-rose/40 hover:text-rose"><X size={14} />Reject</button><button onClick={() => setDecision("pending")} className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-xs text-fg-mute"><RotateCcw size={13} />Reset</button><button onClick={() => setDecision("approved")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"><Check size={14} />Stage approval</button></div>
      </div>
    </div>
  );
}
