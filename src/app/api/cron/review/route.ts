import { NextRequest, NextResponse } from "next/server";
import { consoleUrl, startAgentSession } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getSite } from "@/lib/data";

/**
 * The autonomous loop. Vercel Cron (see vercel.json) hits this endpoint on a
 * schedule; it kicks off a full site review with the SEO Content Strategy
 * Agent. All resulting changes surface as GitHub PRs for human approval —
 * the agents never deploy anything directly.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    req.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: site } = await getSite();
  const siteUrl = site?.url ?? "https://seoforge.online";
  const repo = site?.github_repo ?? process.env.GITHUB_REPO ?? "Helsinki-Code/seo-forge";

  try {
    const session = await startAgentSession({
      agent: "strategist",
      mountRepo: true,
      title: `Scheduled SEO review — ${new Date().toISOString().slice(0, 10)}`,
      kickoff: [
        `Run a scheduled autonomous SEO review of ${siteUrl}.`,
        `1. Crawl the site (homepage, sitemap, key pages) and note on-page issues.`,
        `2. Run fresh SERP checks for the site's priority keywords; record position movements and SERP-feature changes.`,
        `3. Identify the 3 highest-impact optimizations (titles, metas, internal links, content refreshes).`,
        `4. For each optimization, produce the exact file-level change needed in the ${repo} repository.`,
        `5. Apply the highest-impact changes via the change-delivery protocol below (seo/* branches only — a human approves every merge).`,
        `Report findings as a concise summary: what moved, what you recommend, expected impact.`,
      ].join("\n"),
    });

    try {
      await supabase().from("agent_runs").insert({
        site_id: site?.id === "demo" ? null : site?.id,
        agent_name: "SEO Content Strategy Agent",
        session_id: session.id,
        kind: "full_review",
        status: "running",
      });
    } catch {
      // DB not ready
    }

    return NextResponse.json({ ok: true, sessionId: session.id, consoleUrl: consoleUrl(session.id) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "cron review failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
