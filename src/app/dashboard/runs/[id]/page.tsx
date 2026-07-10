import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import { consoleUrl, getSessionMessages } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import type { AgentRun } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let run: AgentRun | null = null;
  try {
    const { data } = await supabase().from("agent_runs").select("*").eq("id", id).single();
    run = data as AgentRun;
  } catch {
    run = null;
  }
  if (!run) notFound();

  const messages = run.session_id ? await getSessionMessages(run.session_id) : [];

  return (
    <>
      <PageHeader title={run.agent_name} subtitle={`${run.kind} · started ${timeAgo(run.created_at)}`}>
        <div className="flex items-center gap-3">
          <StatusBadge status={run.status} />
          {run.session_id && (
            <a
              href={consoleUrl(run.session_id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-panel px-3.5 py-2 text-sm text-fg transition-colors duration-200 hover:border-edge-2"
            >
              Open in Console <ExternalLink size={14} aria-hidden />
            </a>
          )}
        </div>
      </PageHeader>

      {run.summary && (
        <div className="panel mb-6 p-5">
          <p className="text-xs uppercase tracking-wider text-fg-faint">Summary</p>
          <p className="mt-2 text-sm text-fg-mute">{run.summary}</p>
        </div>
      )}

      <section className="panel p-6">
        <h2 className="mb-4 text-sm font-semibold">Agent findings & report</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-fg-faint">
            No messages retrieved yet
            {run.status === "running" ? " — the agent is still working. Refresh in a bit." : "."}
          </p>
        ) : (
          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-mute">{m}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs text-fg-faint">
        If this run pushed <code className="display">seo/*</code> branches, they become pull
        requests in{" "}
        <Link href="/dashboard/approvals" className="text-primary hover:underline">
          Approvals
        </Link>{" "}
        automatically (or hit &quot;Scan agent branches&quot; there).
      </p>
    </>
  );
}
