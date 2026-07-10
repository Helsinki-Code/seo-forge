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

  for (const site of sites) {
    try {
      const session = await startAgentSession({
        agent: "strategist",
        site,
        withChanges: true,
        title: `Scheduled SEO review — ${site.name} — ${new Date().toISOString().slice(0, 10)}`,
        kickoff: [
          `Run a scheduled autonomous SEO review of ${site.url}.`,
          `1. Crawl the site (homepage, sitemap, key pages) and note on-page issues.`,
          `2. Run fresh SERP checks for the site's priority keywords; record position movements and SERP-feature changes.`,
          `3. Identify the 3 highest-impact optimizations (titles, metas, internal links, content refreshes).`,
          `4. Deliver those changes via the change-delivery protocol below — a human approves everything before it goes live.`,
          `Report findings as a concise summary: what moved, what you recommend, expected impact.`,
        ].join("\n"),
      });

      try {
        await supabase().from("agent_runs").insert({
          site_id: site.id,
          agent_name: "SEO Content Strategy Agent",
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

  return NextResponse.json({ ok: true, started, failed });
}
