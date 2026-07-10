import Anthropic from "@anthropic-ai/sdk";
import type { Site } from "./data";
import { siteRepoOf, siteTokenOf } from "./github";

/** The autonomous SEO team — persisted Anthropic Managed Agents. */
export const AGENT_TEAM = {
  orchestrator: {
    id: "agent_01JRrrCZpTmUc7wqvfpSnR7V",
    name: "Content Production Orchestrator",
    role: "Coordinates the full content pipeline end to end",
  },
  blogger: {
    id: "agent_011yZAZvEyyCSwepSsNuuUbn",
    name: "Primary Blogger Agent",
    role: "Niche research, blog planning, content calendar",
  },
  contextBuilder: {
    id: "agent_014L1XwJ8RUGKYbNxxzba3q7",
    name: "Product Marketing Context Builder",
    role: "Maintains the product marketing context document",
  },
  siteArchitect: {
    id: "agent_01Rwi3rgNFMCxDkymZ5EFgYD",
    name: "Site Architecture Agent",
    role: "Page hierarchy, URL map, internal linking plan",
  },
  strategist: {
    id: "agent_014EVPXbSk2QKENRm34b9fu9",
    name: "SEO Content Strategy Agent",
    role: "SERP analysis, keyword clustering, CTR titles & metas",
  },
  writer: {
    id: "agent_01TCFkz2D7UVZMb4ECysQ1fc",
    name: "SEO Content Writer Agent",
    role: "Publish-ready articles with links and image specs",
  },
  imageGenerator: {
    id: "agent_01GVw7DZANtMcoXc9NJHrWX8",
    name: "Article Image Generator",
    role: "Generates on-brand images matching article tone & style",
  },
  affiliate: {
    id: "agent_019trfc6SQDBHP58X7USGH9x",
    name: "Affiliate Product Research Agent",
    role: "Maps affiliate income opportunities per article",
  },
} as const;

export type AgentKey = keyof typeof AGENT_TEAM;

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

/** Branch protocol appended when the website repo is mounted in a session. */
export function branchProtocol(repo: string): string {
  return [
    ``,
    `--- CHANGE-DELIVERY PROTOCOL (mandatory) ---`,
    `The website repository (${repo}) is mounted at /workspace/site with push access.`,
    `When you have concrete file-level changes:`,
    `1. cd /workspace/site && git checkout -b seo/<short-kebab-slug> (one branch per coherent change set)`,
    `2. Apply the changes, commit with a clear message explaining the SEO rationale, and push the branch.`,
    `3. Do NOT open a pull request and do NOT push to main — the SEO Forge platform`,
    `   detects seo/* branches, opens the PR, and a human approves the merge.`,
    `4. End your run with a short summary: branches pushed, files changed, expected impact.`,
    `If your findings need no file changes, just report them clearly.`,
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

/** Create a Managed Agents session and send the kickoff message. */
export async function startAgentSession(opts: {
  agent: AgentKey;
  title: string;
  kickoff: string;
  /** The user's connected site — decides repo mount vs WordPress protocol. */
  site?: Site | null;
  /** Attach the change-delivery protocol (reviews/content runs). */
  withChanges?: boolean;
}) {
  const client = anthropic();
  const site = opts.site;
  const isGithub = !!site && (site.platform ?? "github") === "github" && !!site.github_repo;
  const isWp = !!site && site.platform === "wordpress";

  let mount = false;
  let repoFull = "";
  let token = "";
  if (opts.withChanges && isGithub && site) {
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
  if (opts.withChanges && mount) kickoff += branchProtocol(repoFull);
  else if (opts.withChanges && isWp && site) kickoff += wpProtocol(site.url);
  await client.beta.sessions.events.send(session.id, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: kickoff }],
      },
    ],
  });
  return session;
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

export function consoleUrl(sessionId: string): string {
  return `https://platform.claude.com/workspaces/default/sessions/${sessionId}`;
}
