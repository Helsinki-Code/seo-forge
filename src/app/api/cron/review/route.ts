import { NextRequest, NextResponse } from "next/server";
import { startAgentSession } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import type { Site } from "@/lib/data";

/**
 * The autonomous loop — multi-tenant. Vercel Cron hits this on a schedule and
 * every connected site gets a fresh SEO review. All resulting changes surface
 * as approvals (GitHub PRs or WordPress change cards) — agents never deploy.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    req.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let sites: Site[] = [];
  try {
    const { data, error } = await supabase()
      .from("sites")
      .select("*")
      .not("user_id", "is", null)
      .limit(25);
    if (error) throw error;
    sites = (data as Site[]) ?? [];
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const started: { siteId: string; sessionId: string }[] = [];
  const failed: { siteId: string; error: string }[] = [];
  const skipped: { siteId: string; reason: string }[] = [];

  for (const site of sites) {
    try {
      const result = await startAgentSession({
        agent: "supervisor",
        site,
        withChanges: true,
        title: `Scheduled SEO review — ${site.name} — ${new Date().toISOString().slice(0, 10)}`,
        kickoff: [
          `Run a scheduled autonomous review cycle for ${site.url}.`,
          `Route investigation and any resulting work to the right specialists (content growth, search`,
          `optimization, site experience) per your normal routing table and monitoring cadence.`,
          `Identify the highest-impact findings and, where a change is warranted, prepare a validated`,
          `implementation proposal — a human approves everything before it goes live.`,
          `Report back a concise summary: what you found, what you recommend, expected impact.`,
        ].join("\n"),
      });

      if (result.conflict) {
        skipped.push({ siteId: site.id, reason: `run ${result.runningRunId} still in progress` });
        continue;
      }
      const session = result.session;

      try {
        await supabase().from("agent_runs").insert({
          site_id: site.id,
          agent_name: "SEOForge Workflow Supervisor",
          session_id: session.id,
          kind: "full_review",
          status: "running",
        });
      } catch {
        // best-effort
      }
      started.push({ siteId: site.id, sessionId: session.id });
    } catch (e) {
      failed.push({ siteId: site.id, error: e instanceof Error ? e.message : "failed" });
    }
  }

  return NextResponse.json({ ok: true, started, skipped, failed });
}
