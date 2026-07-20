import { NextRequest, NextResponse } from "next/server";
import { anthropic, getSessionMessages } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getSiteById, logActivity } from "@/lib/data";
import { syncAgentBranches, siteRepoOf } from "@/lib/github";
import { parseWpChanges } from "@/lib/wordpress";
import { parseArtifacts, ingestArtifacts } from "@/lib/artifacts";

/** Maps the `agent_runs.agent_name` string back to the artifact-routing key. */
function sourceAgentOf(agentName: string): "content_growth" | "search_optimization" | "site_experience" | "supervisor" {
  if (agentName.includes("Content Growth")) return "content_growth";
  if (agentName.includes("Search Optimization")) return "search_optimization";
  if (agentName.includes("Site Experience")) return "site_experience";
  return "supervisor";
}

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
 * queue: GitHub sites → seo-agent/* branches become (or already are) PRs;
 * WordPress sites → the structured changes block becomes approval cards.
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
      .select("id, site_id, agent_name")
      .eq("session_id", sessionId)
      .single();
    const run = runRow as { id?: string; site_id?: string; agent_name?: string } | null;
    const siteId = run?.site_id ?? null;

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
      const messages = site ? await getSessionMessages(sessionId) : [];

      // Structured artifacts (SearchFinding, ContentOpportunity, ExperimentPlan,
      // OptimizationImplementationRequest/ContentPublishingRequest,
      // ImplementationProposal, ReadinessGap, ...) — parsed from the same
      // agent.message text regardless of delivery platform. Runs BEFORE the
      // PR/WordPress bridge below so a handoff artifact's placeholder
      // `approvals` row already exists by the time the bridge looks for one
      // to claim instead of duplicating.
      if (site) {
        try {
          const artifacts = parseArtifacts(messages);
          if (artifacts.length > 0) {
            const { ingested, skipped } = await ingestArtifacts(
              site.id,
              sessionId,
              sourceAgentOf(run?.agent_name ?? ""),
              artifacts,
            );
            if (ingested > 0) {
              await logActivity(
                site.id,
                "agent",
                `Parsed ${ingested} structured artifact${ingested > 1 ? "s" : ""}${skipped > 0 ? ` (${skipped} skipped)` : ""} from this run.`,
              );
            }
          }
        } catch {
          // best-effort — ingestion never blocks the webhook's 200 response
        }
      }

      if (site && (site.platform ?? "github") === "github") {
        try {
          const found = await syncAgentBranches(site);
          const { owner, repo } = siteRepoOf(site);
          const { data: existing } = await supabase()
            .from("approvals")
            .select("pr_number")
            .eq("site_id", site.id)
            .not("pr_number", "is", null);
          const known = new Set((existing ?? []).map((r) => r.pr_number as number));

          // Placeholder rows the artifact ingestion above may have just
          // created (a handoff artifact arrived before this PR did). Claim
          // them instead of inserting a duplicate row for the same proposal.
          const { data: placeholders } = await supabase()
            .from("approvals")
            .select("id")
            .eq("site_id", site.id)
            .eq("session_id", sessionId)
            .eq("status", "pending")
            .is("pr_number", null);
          const placeholderQueue = [...(placeholders ?? [])] as { id: string }[];

          for (const c of found) {
            if (known.has(c.prNumber)) continue; // already tracked — don't duplicate
            const placeholder = placeholderQueue.shift();
            if (placeholder) {
              await supabase()
                .from("approvals")
                .update({
                  title: c.title,
                  kind: "pr",
                  repo: `${owner}/${repo}`,
                  pr_number: c.prNumber,
                  detail: `Agent branch ${c.branch} — review the diff, then approve to merge & deploy.`,
                })
                .eq("id", placeholder.id);
            } else {
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
            }
            await logActivity(site.id, "agent", `Opened PR #${c.prNumber}: ${c.title}`);
          }
        } catch {
          // bridge is best-effort; manual sync button exists on Approvals
        }
      } else if (site && site.platform === "wordpress") {
        try {
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
