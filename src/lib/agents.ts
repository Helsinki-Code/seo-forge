import Anthropic from "@anthropic-ai/sdk";
import type { Site } from "./data";
import { siteRepoOf, siteTokenOf } from "./github";
import { supabase } from "./supabase";

/**
 * The live SEOForge agent team — 4 persisted Anthropic Managed Agents.
 * The Workflow Supervisor is a `multiagent` coordinator whose own agent
 * definition embeds the 3 specialists (visible on `session.agent.multiagent.agents`
 * when you create/retrieve a session against it). Messaging the supervisor
 * runs as a single session; if/when it delegates to a specialist, that shows
 * up as an additional `session.thread_status_running/idle` event pair on the
 * SAME session, tagged with a `session_thread_id` and the specialist's
 * `agent_name` — there is no separate child session id to track (verified
 * against a live session).
 *
 * The 3 specialists each carry their own vault-mediated MCP connectors
 * (DataForSEO/Firecrawl/fal.ai for content+search, GitHub for site
 * experience) baked into their platform agent definition, so this app no
 * longer needs to mount anything for them — only the Site Experience
 * Engineer still needs a repository mount to produce a patch.
 */
export const AGENT_TEAM = {
  supervisor: {
    id: "agent_01NR9DZx3Z1S3fut7dFSNzYZ",
    name: "SEOForge Workflow Supervisor",
    role: "Routes work across the team, enforces budgets, quotas, and the human approval gate",
  },
  contentGrowth: {
    id: "agent_01Ti9yWWp9H58CBqfXfgynEy",
    name: "SEOForge Content Growth Agent",
    role: "Opportunity research, briefs, evidence-backed writing, media direction, monetization",
  },
  searchOptimization: {
    id: "agent_01FK4xATicBCTxA9yVvewzAm",
    name: "SEOForge Search Optimization Agent",
    role: "Rankings, technical SEO, competitors, backlinks, GEO/AI-citation visibility",
  },
  siteExperience: {
    id: "agent_017t3uSLPEro7AkGeV6gQY6c",
    name: "SEOForge Site Experience Engineer",
    role: "Repository/CMS implementation — validated proposals and pull requests",
  },
} as const;

export type AgentKey = keyof typeof AGENT_TEAM;

/**
 * The workspace credential vault holding every specialist's MCP credentials
 * (DataForSEO, Firecrawl, fal.ai, GitHub). Vault credentials are matched to
 * an agent's `mcp_servers` entries purely by URL — there is no per-connector
 * reference to set in the agent config itself — but the match only activates
 * when a session's `vault_ids` includes this vault. Every session this app
 * creates must carry it, or every MCP tool call fails with "no credential
 * is stored for this server URL" regardless of how the vault is configured.
 */
const CREDENTIAL_VAULT_ID = "vlt_011CdCrPi2c496nVaiRCAPLd";

let cached: Anthropic | null = null;
export function anthropic(): Anthropic {
  if (cached) return cached;
  cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cached;
}

export function environmentId(): string {
  const id = process.env.ANTHROPIC_ENVIRONMENT_ID;
  if (!id) throw new Error("ANTHROPIC_ENVIRONMENT_ID not set");
  return id;
}

/**
 * Change-delivery protocol appended when the website repo is mounted for
 * the Site Experience Engineer. The agent validates its change locally
 * (build/lint/tests against the mounted working copy) but never pushes a
 * branch or opens a PR itself — its own GitHub MCP connector is a single
 * credential shared across every customer's session and can't safely hold
 * write access to an arbitrary customer's repo. Instead it reports the
 * finished diff as a structured `ImplementationProposal`, and the platform
 * (`openProposalPR` in lib/github.ts) opens the real branch/PR using THAT
 * customer's own token — the same mechanism `mergePR`/`syncAgentBranches`
 * already use, which is what makes this safe to run against any customer's
 * repo, not just one.
 */
export function branchProtocol(repo: string): string {
  return [
    ``,
    `--- CHANGE-DELIVERY PROTOCOL (mandatory) ---`,
    `The website repository (${repo}) is mounted read-only at /workspace/site for investigation and`,
    `local validation only (build, lint, tests). You do NOT have push access and must NOT attempt to`,
    `create a branch, commit, push, or open a PR yourself, even via your own GitHub tools — the platform`,
    `does that using the site owner's own credentials, not yours.`,
    `When you have a concrete, validated file-level change:`,
    `1. Apply and validate it locally against the mounted copy (build/lint/tests), then discard your`,
    `   local changes — nothing you write to /workspace/site is pushed anywhere.`,
    `2. Report it as a complete \`ImplementationProposal\` artifact with the FULL new content of every`,
    `   changed file (not a truncated diff): { "artifactType": "ImplementationProposal", ..., "diff":`,
    `   { "files": [ { "path": "src/app/about/page.tsx", "newContent": "<complete file contents>" } ] } }.`,
    `3. The platform opens the real branch and PR from this artifact — never merges it. A human approves`,
    `   every merge in the SEOForge dashboard.`,
    `If your findings need no file changes, just report them clearly and omit the artifact.`,
  ].join("\n");
}

/** Change protocol for WordPress sites: structured JSON the platform applies. */
export function wpProtocol(url: string): string {
  return [
    ``,
    `--- CHANGE-DELIVERY PROTOCOL (mandatory) ---`,
    `This is a WordPress site: ${url}. You have NO direct write access.`,
    `Review the live site with web_fetch (pages, posts, ${url.replace(/\/$/, "")}/wp-json/wp/v2/posts for post IDs).`,
    `When you have concrete changes, END your final message with exactly one fenced block:`,
    "```seo-forge-changes",
    `{"changes":[`,
    `  {"type":"update_post","post_id":123,"title":"...","meta_description":"...","content_html":"...","rationale":"..."},`,
    `  {"type":"new_post","title":"...","slug":"...","content_html":"...","meta_description":"...","rationale":"..."}`,
    `]}`,
    "```",
    `Rules: valid JSON only inside the block; include only fields you are changing;`,
    `content_html must be complete, publish-ready HTML. The SEO Forge platform turns each`,
    `change into an approval card — a human reviews and applies it via the WordPress API.`,
    `If your findings need no changes, just report them clearly and omit the block.`,
  ].join("\n");
}

type AnthropicSession = Awaited<ReturnType<InstanceType<typeof Anthropic>["beta"]["sessions"]["create"]>>;

export type StartSessionResult =
  | { conflict: false; session: AnthropicSession }
  | { conflict: true; runningRunId: string };

/**
 * Create a Managed Agents session and send the kickoff message.
 *
 * Best-effort concurrency guard: refuses to start a second session for a
 * site that already has an `agent_runs` row stuck at `status: "running"`.
 * This is a same-request read-then-write check, not a real distributed
 * lock — there's no queue/lock infra in this app — but it's the one honest
 * "prevent conflicts" signal the Supervisor Control Room can show, and it
 * stops the nightly cron from double-starting a review on a slow site.
 */
export async function startAgentSession(opts: {
  agent: AgentKey;
  title: string;
  kickoff: string;
  /** The user's connected site — decides repo mount vs WordPress protocol. */
  site?: Site | null;
  /** Attach the change-delivery protocol (reviews/content runs). Only the
   * Site Experience Engineer ever delivers file/CMS changes directly — the
   * other agents research/plan/write and hand off structured requests to it
   * instead, so this flag is a no-op for any other agent key. */
  withChanges?: boolean;
}): Promise<StartSessionResult> {
  const client = anthropic();
  const site = opts.site;

  if (site) {
    const { data: running } = await supabase()
      .from("agent_runs")
      .select("id")
      .eq("site_id", site.id)
      .eq("status", "running")
      .limit(1)
      .maybeSingle();
    if (running) return { conflict: true, runningRunId: (running as { id: string }).id };
  }
  const isGithub = !!site && (site.platform ?? "github") === "github" && !!site.github_repo;
  const isWp = !!site && site.platform === "wordpress";
  const deliversChanges = !!opts.withChanges && opts.agent === "siteExperience";

  let mount = false;
  let repoFull = "";
  let token = "";
  if (deliversChanges && isGithub && site) {
    try {
      const { owner, repo } = siteRepoOf(site);
      repoFull = `${owner}/${repo}`;
      token = siteTokenOf(site);
      mount = true;
    } catch {
      mount = false; // no token — agent can still review read-only via web
    }
  }

  const session = await client.beta.sessions.create({
    agent: AGENT_TEAM[opts.agent].id,
    environment_id: environmentId(),
    title: opts.title,
    // Every specialist's mcp_servers entries are auth-less by design — the
    // Anthropic API matches vault credentials to a connector purely by URL,
    // and that matching only activates when the session carries vault_ids.
    // Omitting this was the actual cause of "no credential is stored for
    // this server URL" — the credentials existed, the vault was just never
    // attached to the session that needed them.
    vault_ids: [CREDENTIAL_VAULT_ID],
    ...(mount
      ? {
          resources: [
            {
              type: "github_repository" as const,
              url: `https://github.com/${repoFull}`,
              authorization_token: token,
              mount_path: "/workspace/site",
            },
          ],
        }
      : {}),
  });

  let kickoff = opts.kickoff;
  if (deliversChanges && mount) kickoff += branchProtocol(repoFull);
  else if (deliversChanges && isWp && site) kickoff += wpProtocol(site.url);
  await client.beta.sessions.events.send(session.id, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: kickoff }],
      },
    ],
  });
  return { conflict: false, session };
}

/** Text content of the agent's messages in a session (for the run detail view). */
export async function getSessionMessages(sessionId: string): Promise<string[]> {
  const client = anthropic();
  const out: string[] = [];
  try {
    const events = await client.beta.sessions.events.list(sessionId);
    type Block = { type: string; text?: string };
    type Ev = { type: string; content?: Block[] };
    for (const ev of (events.data ?? []) as unknown as Ev[]) {
      if (ev.type === "agent.message" && Array.isArray(ev.content)) {
        const text = ev.content
          .filter((b) => b.type === "text" && b.text)
          .map((b) => b.text)
          .join("\n");
        if (text.trim()) out.push(text);
      }
    }
  } catch {
    // session may be deleted or unreachable — caller handles empty
  }
  return out;
}

/**
 * Per-thread activity for a session, keyed off `session.thread_status_*`
 * events — this is what the live multi-agent activity feed (Phase 4) will
 * read to show which of the 4 agents is currently active and its status.
 * Verified against a real session: thread events carry `agent_name` and
 * `session_thread_id`; there is no separate child session id.
 */
export type ThreadActivity = {
  threadId: string;
  agentName: string;
  status: "running" | "idle";
  lastEventAt: string;
};

export async function getThreadActivity(sessionId: string): Promise<ThreadActivity[]> {
  const client = anthropic();
  const byThread = new Map<string, ThreadActivity>();
  try {
    const events = await client.beta.sessions.events.list(sessionId);
    type ThreadEv = {
      type: string;
      session_thread_id?: string;
      agent_name?: string;
      processed_at?: string;
    };
    for (const ev of (events.data ?? []) as unknown as ThreadEv[]) {
      if (ev.type !== "session.thread_status_running" && ev.type !== "session.thread_status_idle") continue;
      if (!ev.session_thread_id) continue;
      byThread.set(ev.session_thread_id, {
        threadId: ev.session_thread_id,
        agentName: ev.agent_name ?? "Unknown agent",
        status: ev.type === "session.thread_status_running" ? "running" : "idle",
        lastEventAt: ev.processed_at ?? new Date().toISOString(),
      });
    }
  } catch {
    // session may be deleted or unreachable — caller handles empty
  }
  return [...byThread.values()];
}

/**
 * Structured artifacts (SearchFinding, ContentOpportunity, ImplementationProposal,
 * etc.) arrive as fenced ```json code blocks inside normal `agent.message`
 * text — verified against a live session. Parsing/routing lives in
 * `lib/artifacts.ts` (`parseArtifacts`/`ingestArtifacts`), called from the
 * webhook handler on every finished run.
 */

export function consoleUrl(sessionId: string): string {
  return `https://platform.claude.com/workspaces/default/sessions/${sessionId}`;
}
