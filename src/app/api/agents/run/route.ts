import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { AGENT_TEAM, AgentKey, consoleUrl, startAgentSession } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getSite, logActivity } from "@/lib/data";

const Body = z.object({
  agent: z.enum(Object.keys(AGENT_TEAM) as [AgentKey, ...AgentKey[]]),
  kind: z.enum(["full_review", "serp_check", "content", "media", "deploy"]),
  prompt: z.string().min(4).max(4000),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { agent, kind, prompt } = parsed.data;

  try {
    const session = await startAgentSession({
      agent,
      title: `${AGENT_TEAM[agent].name} — ${kind}`,
      kickoff: prompt,
      // Reviews and content work get the website repo mounted so concrete
      // changes come back as seo/* branches → PRs → the Approvals queue.
      mountRepo: ["full_review", "content", "deploy"].includes(kind),
    });

    const { data: site } = await getSite();
    try {
      await supabase().from("agent_runs").insert({
        site_id: site?.id === "demo" ? null : site?.id,
        agent_name: AGENT_TEAM[agent].name,
        session_id: session.id,
        kind,
        status: "running",
      });
      if (site && site.id !== "demo") {
        await logActivity(site.id, "human", `Triggered ${AGENT_TEAM[agent].name} (${kind})`);
      }
    } catch {
      // DB not ready — session still started
    }

    return NextResponse.json({
      sessionId: session.id,
      consoleUrl: consoleUrl(session.id),
      status: session.status,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "agent session failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
