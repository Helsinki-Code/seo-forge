import { NextRequest, NextResponse } from "next/server";
import { anthropic, getSessionMessages } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getSiteById, logActivity } from "@/lib/data";
import { syncAgentBranches, siteRepoOf } from "@/lib/github";
import { parseWpChanges } from "@/lib/wordpress";

/**
 * Anthropic Managed Agents webhook receiver (multi-tenant).
 *
 * Register in the Anthropic Console (Manage → Webhooks):
 *   URL:    https://seoforge.online/api/webhooks/anthropic
 *   Events: session.status_run_started, session.status_idled,
 *           session.status_terminated
 * Store the whsec_ signing secret as ANTHROPIC_WEBHOOK_SIGNING_KEY.
 *
 * On completion this bridges agent output into the owning site's approval
 * queue: GitHub sites → seo/* branches become PRs; WordPress sites → the
 * structured changes block becomes approval cards.
 */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_WEBHOOK_SIGNING_KEY) {
    return NextResponse.json({ error: "webhook signing key not configured" }, { status: 503 });
  }

  const raw = await req.text(); // raw body — re-serialized JSON breaks the MAC
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => (headers[k] = v));

  let event: { id: string; data: { type: string; id: string } };
  try {
    event = (await anthropic().beta.webhooks.unwrap(raw, { headers })) as unknown as {
      id: string;
      data: { type: string; id: string };
    };
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const { type, id: sessionId } = event.data;

  const statusMap: Record<string, { status: string; finished: boolean }> = {
    "session.status_run_started": { status: "running", finished: false },
    "session.status_idled": { status: "done", finished: true },
    "session.status_terminated": { status: "failed", finished: true },
  };
  const mapped = statusMap[type];
  if (!mapped) return NextResponse.json({ ok: true, ignored: type });

  try {
    // Which run / site does this session belong to?
    const { data: runRow } = await supabase()
      .from("agent_runs")
      .select("id, site_id")
      .eq("session_id", sessionId)
      .single();
    const siteId = (runRow as { site_id?: string } | null)?.site_id ?? null;

    const update: Record<string, unknown> = { status: mapped.status };
    if (mapped.finished) update.finished_at = new Date().toISOString();
    if (mapped.finished) {
      try {
        const session = await anthropic().beta.sessions.retrieve(sessionId);
        update.summary = `${session.title ?? "Session"} — ${mapped.status}`;
      } catch {
        // summary is best-effort
      }
    }
    await supabase().from("agent_runs").update(update).eq("session_id", sessionId);

    if (siteId) {
      await logActivity(siteId, "agent", `Session ${sessionId.slice(0, 14)}… → ${mapped.status}`);
    }

    // Bridge finished runs into the owning site's approval queue
    if (mapped.finished && siteId) {
      const site = await getSiteById(siteId);
      if (site && (site.platform ?? "github") === "github") {
        try {
          const created = await syncAgentBranches(site);
          const { owner, repo } = siteRepoOf(site);
          for (const c of created) {
            await supabase().from("approvals").insert({
              site_id: site.id,
              title: c.title,
              kind: "pr",
              repo: `${owner}/${repo}`,
              pr_number: c.prNumber,
              detail: `Agent branch ${c.branch} — review the diff, then approve to merge & deploy.`,
              status: "pending",
              session_id: sessionId,
            });
            await logActivity(site.id, "agent", `Opened PR #${c.prNumber}: ${c.title}`);
          }
        } catch {
          // bridge is best-effort; manual sync button exists on Approvals
        }
      } else if (site && site.platform === "wordpress") {
        try {
          const messages = await getSessionMessages(sessionId);
          const changes = parseWpChanges(messages);
          for (const change of changes) {
            const title =
              change.type === "update_post"
                ? `Update post #${change.post_id}${change.title ? `: ${change.title}` : ""}`
                : `New post: ${change.title}`;
            await supabase().from("approvals").insert({
              site_id: site.id,
              title,
              kind: change.type === "update_post" ? "wp_update" : "wp_new",
              detail: change.rationale ?? "Proposed by the agent team.",
              payload: change,
              status: "pending",
              session_id: sessionId,
            });
          }
          if (changes.length > 0) {
            await logActivity(
              site.id,
              "agent",
              `${changes.length} WordPress change${changes.length > 1 ? "s" : ""} awaiting approval`,
            );
          }
        } catch {
          // best-effort
        }
      }
    }
  } catch {
    // DB not ready — acknowledge anyway so Anthropic doesn't retry forever
  }

  return NextResponse.json({ ok: true });
}
