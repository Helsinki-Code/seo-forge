import { NextRequest, NextResponse } from "next/server";
import { AGENT_TEAM, startAgentSession } from "@/lib/agents";
import { supabase } from "@/lib/supabase";
import { getSiteById, type Experiment } from "@/lib/data";

/** Extracts a day count from a free-text observation window like "14 days
 * or 2,000 sessions, whichever comes first". Falls back to 14 if unparseable
 * — better to check slightly early than to leave a finished experiment
 * unmeasured indefinitely. */
function windowDays(observationWindow: string | null): number {
  const match = observationWindow?.match(/(\d+)\s*day/i);
  return match ? Number(match[1]) : 14;
}

/**
 * Closes the loop the nightly review can't: an experiment left `running`
 * has no proactive re-check today — nothing re-invokes an agent once its
 * observation window elapses, so `ExperimentObservation`/`OptimizationOutcome`
 * artifacts only land if an agent happens to mention it unprompted in a
 * later run. This cron finds experiments whose window has elapsed and asks
 * the Search Optimization Agent to measure and report the outcome.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    req.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let experiments: Experiment[] = [];
  try {
    const { data, error } = await supabase()
      .from("experiments")
      .select("*")
      .eq("status", "running")
      .limit(50);
    if (error) throw error;
    experiments = (data as Experiment[]) ?? [];
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const now = Date.now();
  const due = experiments.filter((e) => {
    const start = e.started_at ?? e.created_at;
    return now - new Date(start).getTime() > windowDays(e.observation_window) * 864e5;
  });

  const started: { experimentId: string; siteId: string; sessionId: string }[] = [];
  const failed: { experimentId: string; error: string }[] = [];
  const skipped: { experimentId: string; reason: string }[] = [];

  for (const exp of due) {
    try {
      const site = await getSiteById(exp.site_id);
      if (!site) {
        skipped.push({ experimentId: exp.id, reason: "site not found" });
        continue;
      }

      const result = await startAgentSession({
        agent: "searchOptimization",
        site,
        title: `Measure experiment — ${exp.hypothesis.slice(0, 60)} — ${site.name}`,
        kickoff: [
          `The observation window for this experiment has elapsed — measure it now.`,
          `Hypothesis: ${exp.hypothesis}`,
          `Primary metric: ${exp.primary_metric}`,
          exp.secondary_metrics.length > 0 ? `Secondary metrics: ${exp.secondary_metrics.join(", ")}` : "",
          `Observation window: ${exp.observation_window ?? "unspecified"}`,
          `Pull the real current data for these metrics on ${site.url}, compare against the pre-experiment`,
          `baseline in your evidence, and report an ExperimentObservation or OptimizationOutcome artifact`,
          `with your keep/iterate/revert recommendation per your own Stage 8 protocol.`,
        ]
          .filter(Boolean)
          .join("\n"),
      });

      if (result.conflict) {
        skipped.push({ experimentId: exp.id, reason: `run ${result.runningRunId} still in progress` });
        continue;
      }
      const session = result.session;

      try {
        await supabase().from("agent_runs").insert({
          site_id: exp.site_id,
          agent_name: AGENT_TEAM.searchOptimization.name,
          session_id: session.id,
          kind: "measure",
          status: "running",
        });
      } catch {
        // best-effort
      }
      started.push({ experimentId: exp.id, siteId: exp.site_id, sessionId: session.id });
    } catch (e) {
      failed.push({ experimentId: exp.id, error: e instanceof Error ? e.message : "failed" });
    }
  }

  return NextResponse.json({ ok: true, checked: experiments.length, due: due.length, started, skipped, failed });
}
