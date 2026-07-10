import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getSite, logActivity } from "@/lib/data";
import { syncAgentBranches, siteRepo } from "@/lib/github";

/**
 * Anthropic Managed Agents webhook receiver.
 *
 * Register in the Anthropic Console (Manage → Webhooks):
 *   URL:    https://seoforge.online/api/webhooks/anthropic
 *   Events: session.status_run_started, session.status_idled,
 *           session.status_terminated
 * Store the whsec_ signing secret as ANTHROPIC_WEBHOOK_SIGNING_KEY.
 *
 * Payloads are thin (event type + resource id) and HMAC-signed; unwrap()
 * verifies the signature and rejects stale deliveries.
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
    const update: Record<string, unknown> = { status: mapped.status };
    if (mapped.finished) update.finished_at = new Date().toISOString();

    // On completion, pull the session title/usage for a human-readable summary
    if (mapped.finished) {
      try {
        const session = await anthropic().beta.sessions.retrieve(sessionId);
        update.summary = `${session.title ?? "Session"} — ${mapped.status}`;
      } catch {
        // summary is best-effort
      }
    }

    await supabase().from("agent_runs").update(update).eq("session_id", sessionId);

    const { data: site } = await getSite();
    if (site && site.id !== "demo") {
      await logActivity(
        site.id,
        "agent",
        `Session ${sessionId.slice(0, 14)}… → ${mapped.status}`,
      );
    }

    // When a run finishes, bridge any agent-pushed seo/* branches into PRs
    // so they surface in the Approvals queue automatically.
    if (mapped.finished && process.env.GITHUB_TOKEN) {
      try {
        const created = await syncAgentBranches();
        const { owner, repo } = siteRepo();
        for (const c of created) {
          await supabase().from("approvals").insert({
            site_id: site?.id === "demo" ? null : site?.id,
            title: c.title,
            kind: "pr",
            repo: `${owner}/${repo}`,
            pr_number: c.prNumber,
            detail: `Agent branch ${c.branch} — review the diff, then approve to merge & deploy.`,
            status: "pending",
            session_id: sessionId,
          });
          if (site && site.id !== "demo") {
            await logActivity(site.id, "agent", `Opened PR #${c.prNumber}: ${c.title}`);
          }
        }
      } catch {
        // bridge is best-effort; manual sync button exists on Approvals
      }
    }
  } catch {
    // DB not ready — acknowledge anyway so Anthropic doesn't retry forever
  }

  return NextResponse.json({ ok: true });
}
