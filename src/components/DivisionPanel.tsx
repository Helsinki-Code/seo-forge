import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { StatusBadge, timeAgo } from "@/components/ui";
import type { AgentRun, Finding } from "@/lib/data";

const SEVERITY_DOT: Record<Finding["severity"], string> = {
  critical: "bg-rose",
  high: "bg-amber",
  medium: "bg-primary",
  low: "bg-fg-faint",
};

export default function DivisionPanel({
  title,
  subtitle,
  icon: Icon,
  runs,
  findings,
  href,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  runs: AgentRun[];
  findings: Finding[];
  href: string;
}) {
  const openFindings = findings.filter((f) => f.status === "open");

  return (
    <section className="panel flex flex-col p-6">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <Link href={href} className="flex items-center gap-1 text-xs text-primary hover:underline">
          open <ArrowRight size={12} aria-hidden />
        </Link>
      </div>
      <p className="mb-4 text-xs text-fg-mute">{subtitle}</p>

      <div className="mb-4 flex items-center gap-4 text-xs">
        <span className="text-fg-mute">
          <span className="display font-semibold text-fg">{openFindings.length}</span> open findings
        </span>
        <span className="text-fg-mute">
          <span className="display font-semibold text-fg">{runs.filter((r) => r.status === "running").length}</span>{" "}
          in flight
        </span>
      </div>

      <div className="mb-4 flex-1 space-y-2">
        {runs.length === 0 && <p className="text-xs text-fg-faint">No runs yet.</p>}
        {runs.slice(0, 3).map((r) => (
          <Link
            key={r.id}
            href={`/dashboard/runs/${r.id}`}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors duration-200 hover:bg-panel-2"
          >
            <StatusBadge status={r.status} />
            <span className="min-w-0 flex-1 truncate text-fg-mute">{r.summary ?? r.kind}</span>
            <span className="shrink-0 text-fg-faint">{timeAgo(r.created_at)}</span>
          </Link>
        ))}
      </div>

      {openFindings.length > 0 && (
        <ul className="space-y-1.5 border-t border-edge pt-3">
          {openFindings.slice(0, 3).map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-xs">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[f.severity]}`} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-fg-mute">{f.title}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
