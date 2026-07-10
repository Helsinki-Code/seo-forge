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

/** Create a Managed Agents session and send the kickoff message. */
export async function startAgentSession(opts: {
  agent: AgentKey;
  title: string;
  kickoff: string;
  /** Mount the website repo so the agent can push seo/* branches. */
  mountRepo?: boolean;
}) {
  const client = anthropic();
  const repoFull = process.env.GITHUB_REPO || "Helsinki-Code/seo-forge";
  const canMount = !!process.env.GITHUB_TOKEN && opts.mountRepo;

  const session = await client.beta.sessions.create({
    agent: AGENT_TEAM[opts.agent].id,
    environment_id: environmentId(),
    title: opts.title,
    ...(canMount
      ? {
          resources: [
            {
              type: "github_repository" as const,
              url: `https://github.com/${repoFull}`,
              authorization_token: process.env.GITHUB_TOKEN!,
              mount_path: "/workspace/site",
            },
          ],
        }
      : {}),
  });

  const kickoff = canMount ? opts.kickoff + branchProtocol(repoFull) : opts.kickoff;
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
