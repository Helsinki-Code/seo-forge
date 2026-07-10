import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { AGENT_TEAM } from "@/lib/agents";
import { getSite } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function EnvRow({ name, ok, hint }: { name: string; ok: boolean; hint: string }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      {ok ? (
        <CheckCircle2 size={16} className="shrink-0 text-mint" aria-hidden />
      ) : (
        <XCircle size={16} className="shrink-0 text-rose" aria-hidden />
      )}
      <code className="display text-xs">{name}</code>
      <span className="flex-1 text-right text-xs text-fg-faint">{hint}</span>
    </li>
  );
}

export default async function SettingsPage() {
  const { data: site, demo } = await getSite();
  const env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseSecret: !!process.env.SUPABASE_SECRET_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    anthropicEnv: !!process.env.ANTHROPIC_ENVIRONMENT_ID,
    github: !!process.env.GITHUB_TOKEN,
    clerk: !!process.env.CLERK_SECRET_KEY,
    cron: !!process.env.CRON_SECRET,
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Connections, agent roster, and site configuration." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="mb-3 text-sm font-semibold">Site</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">Name</dt>
              <dd className="font-medium">{site?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">URL</dt>
              <dd className="font-medium">{site?.url}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">Website repo</dt>
              <dd className="font-medium">{site?.github_repo ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">Database</dt>
              <dd className={demo ? "text-amber" : "text-mint"}>
                {demo ? "demo mode — run supabase/schema.sql" : "Supabase connected"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 text-sm font-semibold">Connections</h2>
          <ul className="divide-y divide-edge">
            <EnvRow name="NEXT_PUBLIC_SUPABASE_URL" ok={env.supabaseUrl} hint="database" />
            <EnvRow name="NEXT_PUBLIC_SUPABASE_ANON_KEY" ok={env.supabaseKey} hint="database" />
            <EnvRow name="SUPABASE_SECRET_KEY" ok={env.supabaseSecret} hint="optional (RLS)" />
            <EnvRow name="ANTHROPIC_API_KEY" ok={env.anthropic} hint="agent team" />
            <EnvRow name="ANTHROPIC_ENVIRONMENT_ID" ok={env.anthropicEnv} hint="agent sessions" />
            <EnvRow name="GITHUB_TOKEN" ok={env.github} hint="PR merge / deploys" />
            <EnvRow name="CLERK_SECRET_KEY" ok={env.clerk} hint="authentication" />
            <EnvRow name="CRON_SECRET" ok={env.cron} hint="scheduled reviews" />
          </ul>
        </section>
      </div>

      <section className="panel mt-6 overflow-x-auto p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Agent ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(AGENT_TEAM).map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="text-fg-mute">{a.role}</TableCell>
                <TableCell>
                  <code className="display text-xs text-fg-faint">{a.id}</code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
