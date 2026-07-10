import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { consoleUrl, startAgentSession } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getSite, logActivity } from "@/lib/data";

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

  try {
    const session = await startAgentSession({
      agent: "imageGenerator",
      title: `Media for ${articleUrl}`,
      kickoff: [
        `Fetch and read the article at ${articleUrl} (use web_fetch).`,
        `Study its tone, style, structure, and existing imagery conventions.`,
        `Generate a featured/hero image plus in-content images for any section that would benefit,`,
        `matching the article's tone and visual style exactly. Provide SEO alt text for every image`,
        `(primary keyword natural, under 125 chars, unique per image) and a labeled manifest.`,
        notes ? `Additional direction from the editor: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    const { data: site } = await getSite();
    try {
      await supabase().from("agent_runs").insert({
        site_id: site?.id === "demo" ? null : site?.id,
        agent_name: "Article Image Generator",
        session_id: session.id,
        kind: "media",
        status: "running",
      });
      if (site && site.id !== "demo") {
        await logActivity(site.id, "human", `Requested media generation for ${articleUrl}`);
      }
    } catch {
      // DB not ready
    }

    return NextResponse.json({ sessionId: session.id, consoleUrl: consoleUrl(session.id) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "agent session failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
