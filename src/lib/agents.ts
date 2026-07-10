import Anthropic from "@anthropic-ai/sdk";

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

/** Create a Managed Agents session and send the kickoff message. */
export async function startAgentSession(opts: {
  agent: AgentKey;
  title: string;
  kickoff: string;
}) {
  const client = anthropic();
  const session = await client.beta.sessions.create({
    agent: AGENT_TEAM[opts.agent].id,
    environment_id: environmentId(),
    title: opts.title,
  });
  await client.beta.sessions.events.send(session.id, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: opts.kickoff }],
      },
    ],
  });
  return session;
}

export function consoleUrl(sessionId: string): string {
  return `https://platform.claude.com/workspaces/default/sessions/${sessionId}`;
}
