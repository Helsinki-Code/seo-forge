import Link from "next/link";
import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/ui";
import ConnectPrompt from "@/components/ConnectPrompt";
import { AGENT_TEAM } from "@/lib/agents";
import { getUserSite } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import GoogleAnalyticsConnection from "@/components/GoogleAnalyticsConnection";
import McpTokenManager from "@/components/McpTokenManager";
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

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;
  const query = await searchParams;

  let googleConnections: Array<{ id: string; email: string; status: string; last_verified_at: string | null }> = [];
  let googleResources: Array<{ id: string; connection_id: string; site_id: string | null; external_id: string; display_name: string; account_name: string | null }> = [];
  let mcpTokens: Array<{ id: string; label: string; token_prefix: string; last_four: string; expires_at: string; last_used_at: string | null; revoked_at: string | null; created_at: string }> = [];
  try {
    const [connectionsResult, resourcesResult, tokenResult] = await Promise.all([
      supabase()
        .from("google_connections")
        .select("id,email,status,last_verified_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false }),
      supabase()
        .from("google_resources")
        .select("id,connection_id,site_id,external_id,display_name,account_name")
        .eq("user_id", userId!)
        .eq("resource_type", "ga4_property")
        .order("account_name")
        .order("display_name"),
      supabase()
        .from("mcp_tokens")
        .select("id,label,token_prefix,last_four,expires_at,last_used_at,revoked_at,created_at")
        .eq("user_id", userId!)
        .eq("site_id", site.id)
        .order("created_at", { ascending: false }),
    ]);
    if (!connectionsResult.error) googleConnections = connectionsResult.data ?? [];
    if (!resourcesResult.error) googleResources = resourcesResult.data ?? [];
    if (!tokenResult.error) mcpTokens = tokenResult.data ?? [];
  } catch {
    // schema-v3 may not have been applied yet; the card will show its empty state.
  }

  const isGithub = (site.platform ?? "github") === "github";
  const env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseSecret: !!process.env.SUPABASE_SECRET_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    anthropicEnv: !!process.env.ANTHROPIC_ENVIRONMENT_ID,
    clerk: !!process.env.CLERK_SECRET_KEY,
    cron: !!process.env.CRON_SECRET,
    webhook: !!process.env.ANTHROPIC_WEBHOOK_SIGNING_KEY,
    encryption: !!process.env.CREDENTIALS_ENCRYPTION_KEY,
    googleClient: !!process.env.GOOGLE_CLIENT_ID,
    googleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    googleRedirect: !!process.env.GOOGLE_REDIRECT_URI,
    mcpPepper: !!process.env.MCP_TOKEN_PEPPER,
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
            <EnvRow name="SUPABASE_SECRET_KEY" ok={env.supabaseSecret} hint="private integration tables" />
            <EnvRow name="ANTHROPIC_API_KEY" ok={env.anthropic} hint="agent team" />
            <EnvRow name="ANTHROPIC_ENVIRONMENT_ID" ok={env.anthropicEnv} hint="agent sessions" />
            <EnvRow name="CLERK_SECRET_KEY" ok={env.clerk} hint="authentication" />
            <EnvRow name="CRON_SECRET" ok={env.cron} hint="scheduled reviews" />
            <EnvRow name="ANTHROPIC_WEBHOOK_SIGNING_KEY" ok={env.webhook} hint="realtime status" />
            <EnvRow name="CREDENTIALS_ENCRYPTION_KEY" ok={env.encryption} hint="secret storage" />
            <EnvRow name="GOOGLE_CLIENT_ID" ok={env.googleClient} hint="GA4 OAuth" />
            <EnvRow name="GOOGLE_CLIENT_SECRET" ok={env.googleSecret} hint="GA4 OAuth" />
            <EnvRow name="GOOGLE_REDIRECT_URI" ok={env.googleRedirect} hint="GA4 OAuth callback" />
            <EnvRow name="MCP_TOKEN_PEPPER" ok={env.mcpPepper} hint="MCP token hashing" />
          </ul>
        </section>
      </div>

      <GoogleAnalyticsConnection
        siteId={site.id}
        connections={googleConnections}
        resources={googleResources}
        result={query.google}
      />

      <McpTokenManager
        siteId={site.id}
        initialTokens={mcpTokens}
        endpoint={`${(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/api/mcp/ga4`}
      />

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
