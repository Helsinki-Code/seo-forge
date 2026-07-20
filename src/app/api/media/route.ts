import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { consoleUrl, startAgentSession } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getUserSite, logActivity } from "@/lib/data";

const Body = z.object({
  articleUrl: z.string().min(4).max(400),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { articleUrl, notes } = parsed.data;

  const { site } = await getUserSite(userId);
  if (!site || site.id === "demo") {
    return NextResponse.json({ error: "Connect your website first." }, { status: 400 });
  }

  try {
    const result = await startAgentSession({
      agent: "contentGrowth",
      title: `Media for ${articleUrl} — ${site.name}`,
      site,
      kickoff: [
        `Fetch and read the article at ${articleUrl} (use web_fetch).`,
        `Study its tone, style, structure, and existing imagery conventions.`,
        `Prepare a MediaRequest for a featured/hero image plus in-content images for any section that`,
        `would benefit, matching the article's tone and visual style exactly, and generate them with`,
        `your fal.ai connector. Provide SEO alt text for every image (primary keyword natural, under`,
        `125 chars, unique per image) and a labeled manifest.`,
        notes ? `Additional direction from the editor: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (result.conflict) {
      return NextResponse.json(
        {
          error: "A run is already in progress for this site. Wait for it to finish before starting another.",
          runningRunId: result.runningRunId,
        },
        { status: 409 },
      );
    }
    const session = result.session;

    try {
      await supabase().from("agent_runs").insert({
        site_id: site.id,
        agent_name: "SEOForge Content Growth Agent",
        session_id: session.id,
        kind: "media",
        status: "running",
      });
      await logActivity(site.id, "human", `Requested media generation for ${articleUrl}`);
    } catch {
      // DB not ready
    }

    return NextResponse.json({ sessionId: session.id, consoleUrl: consoleUrl(session.id) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "agent session failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
