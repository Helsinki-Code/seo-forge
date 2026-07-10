import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fg-mute">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "accent" | "mint" | "rose";
}) {
  const tones = {
    primary: "text-primary",
    accent: "text-amber",
    mint: "text-mint",
    rose: "text-rose",
  } as const;
  return (
    <div className="panel p-5 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-fg-faint">{label}</p>
        <Icon size={16} className={tones[tone]} aria-hidden />
      </div>
      <p className={`display mt-3 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-1.5 text-xs text-fg-mute">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: "bg-primary/15 text-primary",
    idle: "bg-panel-2 text-fg-mute",
    done: "bg-mint/15 text-mint",
    failed: "bg-rose/15 text-rose",
    pending: "bg-amber/15 text-amber",
    approved: "bg-mint/15 text-mint",
    merged: "bg-mint/15 text-mint",
    rejected: "bg-rose/15 text-rose",
    generated: "bg-primary/15 text-primary",
    published: "bg-mint/15 text-mint",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        map[status] ?? "bg-panel-2 text-fg-mute"
      }`}
    >
      {status}
    </span>
  );
}

export function DemoBanner({ demo }: { demo: boolean }) {
  if (!demo) return null;
  return (
    <div className="mb-6 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber">
      Showing demo data — run <code className="display">supabase/schema.sql</code> in
      your Supabase SQL editor to go live.
    </div>
  );
}

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
