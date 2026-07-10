import Link from "next/link";
import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/ui";
import ConnectPrompt from "@/components/ConnectPrompt";
import { AGENT_TEAM } from "@/lib/agents";
import { getUserSite } from "@/lib/data";
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
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;

  const isGithub = (site.platform ?? "github") === "github";
  const env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    anthropicEnv: !!process.env.ANTHROPIC_ENVIRONMENT_ID,
    clerk: !!process.env.CLERK_SECRET_KEY,
    cron: !!process.env.CRON_SECRET,
    webhook: !!process.env.ANTHROPIC_WEBHOOK_SIGNING_KEY,
    encryption: !!process.env.CREDENTIALS_ENCRYPTION_KEY,
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Your site connection, platform health, and the agent roster.">
        <Link
          href="/dashboard/connect"
          className="inline-flex items-center gap-2 rounded-lg border border-edge bg-panel px-3.5 py-2 text-sm text-fg transition-colors duration-200 hover:border-edge-2"
        >
          <Pencil size={14} aria-hidden /> Edit connection
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="mb-3 text-sm font-semibold">Your site</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">Name</dt>
              <dd className="font-medium">{site.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">URL</dt>
              <dd className="font-medium">{site.url}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">Platform</dt>
              <dd className="font-medium capitalize">{site.platform ?? "github"}</dd>
            </div>
            {isGithub ? (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-mute">Repository</dt>
                  <dd className="font-medium">{site.github_repo ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-mute">Access token</dt>
                  <dd className={site.repo_token_enc ? "text-mint" : "text-amber"}>
                    {site.repo_token_enc ? "configured (encrypted)" : "not set"}
                  </dd>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-mute">WP username</dt>
                  <dd className="font-medium">{site.wp_username ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-mute">Application password</dt>
                  <dd className={site.wp_app_password_enc ? "text-mint" : "text-amber"}>
                    {site.wp_app_password_enc ? "configured (encrypted)" : "not set"}
                  </dd>
                </div>
              </>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-fg-mute">Database</dt>
              <dd className={demo ? "text-amber" : "text-mint"}>
                {demo ? "demo mode — apply supabase schema" : "Supabase connected"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 text-sm font-semibold">Platform health</h2>
          <ul className="divide-y divide-edge">
            <EnvRow name="NEXT_PUBLIC_SUPABASE_URL" ok={env.supabaseUrl} hint="database" />
            <EnvRow name="ANTHROPIC_API_KEY" ok={env.anthropic} hint="agent team" />
            <EnvRow name="ANTHROPIC_ENVIRONMENT_ID" ok={env.anthropicEnv} hint="agent sessions" />
            <EnvRow name="CLERK_SECRET_KEY" ok={env.clerk} hint="authentication" />
            <EnvRow name="CRON_SECRET" ok={env.cron} hint="scheduled reviews" />
            <EnvRow name="ANTHROPIC_WEBHOOK_SIGNING_KEY" ok={env.webhook} hint="realtime status" />
            <EnvRow name="CREDENTIALS_ENCRYPTION_KEY" ok={env.encryption} hint="secret storage" />
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
