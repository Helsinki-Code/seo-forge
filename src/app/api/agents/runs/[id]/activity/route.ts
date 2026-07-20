import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getThreadActivity } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getUserSite } from "@/lib/data";

/**
 * Live per-agent-thread status for a run, polled by the Runs detail page
 * while a session is active. Backed by `getThreadActivity` (lib/agents.ts),
 * which reads real `session.thread_status_*` events — verified against a
 * live session: each thread is tagged with the specialist's `agent_name`
 * and a `session_thread_id`, so this reflects which of the 4 agents is
 * actually doing work right now, not a synthetic progress bar.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const { site } = await getUserSite(userId);
  if (!site) return NextResponse.json({ threads: [] });

  const { data: run } = await supabase()
    .from("agent_runs")
    .select("session_id")
    .eq("id", id)
    .eq("site_id", site.id)
    .single();

  const sessionId = (run as { session_id?: string } | null)?.session_id;
  if (!sessionId) return NextResponse.json({ threads: [] });

  const threads = await getThreadActivity(sessionId);
  return NextResponse.json({ threads });
}
