import { supabase } from "./supabase";
import { getSiteById, logActivity } from "./data";
import { openProposalPR } from "./github";

/**
 * Structured artifacts emitted by the specialist agents, per their own
 * system prompts' "Required Outputs" contract. Verified against a live
 * Content Growth Agent session: artifacts arrive as fenced ```json code
 * blocks inside a normal `agent.message` — no special tool call, no
 * dedicated event type.
 */
export type ParsedArtifact = Record<string, unknown> & {
  artifactType: string;
  schemaVersion?: string;
  decisionSummary?: string;
  confidence?: string | number;
  risk?: string;
};

/** Extracts every fenced ```json block that parses to an object with an `artifactType` field. */
export function parseArtifacts(messages: string[]): ParsedArtifact[] {
  const out: ParsedArtifact[] = [];
  const fence = /```json\s*([\s\S]*?)```/g;
  for (const message of messages) {
    let match: RegExpExecArray | null;
    while ((match = fence.exec(message))) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed && typeof parsed === "object" && typeof parsed.artifactType === "string") {
          out.push(parsed as ParsedArtifact);
        }
      } catch {
        // not valid JSON — the agent may have used ```json for something else, skip it
      }
    }
  }
  return out;
}

const FINDING_TYPES = new Set(["SearchFinding", "DataQualityFinding", "ContentOpportunity"]);

function normalizeConfidence(c: unknown): number | null {
  if (typeof c === "number") return c;
  if (typeof c === "string") {
    const map: Record<string, number> = { low: 0.3, medium: 0.6, high: 0.85 };
    if (c.toLowerCase() in map) return map[c.toLowerCase()];
    const n = Number(c);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function normalizeSeverity(a: ParsedArtifact): "low" | "medium" | "high" | "critical" {
  const raw = String(a.severity ?? a.priority ?? "medium").toLowerCase();
  if (raw.includes("critical")) return "critical";
  if (raw.includes("high")) return "high";
  if (raw.includes("low")) return "low";
  return "medium";
}

/** Verified live: ImplementationProposal's `risk` is an object
 * `{classification, blastRadius, reasoning}`, not the plain string other
 * artifact types may use — `approvals.risk` is a constrained
 * low/medium/high text column, so only the classification survives here. */
function riskClassificationOf(a: ParsedArtifact): "low" | "medium" | "high" | null {
  const raw = a.risk;
  const value = typeof raw === "string" ? raw : (raw as Record<string, unknown> | undefined)?.classification;
  const lower = String(value ?? "").toLowerCase();
  if (lower === "low" || lower === "medium" || lower === "high") return lower;
  return null;
}

/** Verified live: ImplementationProposal's rollback plan is an object
 * `{mechanism, steps: [...], blastRadiusIfRolledBack}`, not a plain string —
 * flattened into readable text for the `rollback_plan` text column. */
function rollbackPlanTextOf(a: ParsedArtifact): string | null {
  const raw = (a.rollbackPlan as unknown) ?? (a.rollbackInstructions as unknown) ?? (a.rollback_plan as unknown);
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const mechanism = typeof r.mechanism === "string" ? r.mechanism : null;
    const steps = Array.isArray(r.steps) ? (r.steps as unknown[]).filter((s) => typeof s === "string") : [];
    const parts = [mechanism, ...steps].filter(Boolean);
    return parts.length > 0 ? parts.join(" — ") : null;
  }
  return null;
}

function assetIdOf(a: ParsedArtifact): string | null {
  return (a.assetId as string) ?? (a.asset_id as string) ?? null;
}

/** Extracts affected URLs from a real SearchFinding's `affectedAssets:
 * [{assetId, url, note}]` shape (verified live) — falls back to a flat
 * affectedUrls/affected_urls array in case an agent ever emits one instead. */
function affectedUrlsOf(a: ParsedArtifact): string[] {
  const assets = a.affectedAssets;
  if (Array.isArray(assets)) {
    return assets
      .map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>).url : null))
      .filter((u): u is string => typeof u === "string");
  }
  return (a.affectedUrls as string[]) ?? (a.affected_urls as string[]) ?? [];
}

/**
 * The agent has no way to know a database finding_id — downstream handoff
 * artifacts (OptimizationImplementationRequest, ContentPublishingRequest,
 * ImplementationProposal) correlate back to their originating finding by
 * `assetId` (verified live: the same assetId appears on both the
 * SearchFinding and the OptimizationImplementationRequest it produced).
 * Looks up the most recent finding for this site+assetId, if any.
 */
async function findFindingIdByAsset(siteId: string, assetId: string | null): Promise<string | null> {
  if (!assetId) return null;
  const { data } = await supabase()
    .from("findings")
    .select("id")
    .eq("site_id", siteId)
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

/** Extracts `{path, newContent}` per changed file from an ImplementationProposal's
 * diff payload. Shape isn't pinned down by a real successful proposal yet
 * (the one live diagnostic run got blocked before reaching this artifact) —
 * accepts a few reasonable field-name variants, returns null if none match
 * so the caller falls back to just recording the proposal without opening a PR. */
function proposalFilesOf(a: ParsedArtifact): { path: string; newContent: string }[] | null {
  const diff = (a.diff as unknown) ?? (a.diffSummary as unknown) ?? (a.repositoryPatch as unknown);
  const raw = Array.isArray(diff)
    ? diff
    : diff && typeof diff === "object" && Array.isArray((diff as Record<string, unknown>).files)
      ? (diff as Record<string, unknown>).files
      : null;
  if (!Array.isArray(raw)) return null;
  const files: { path: string; newContent: string }[] = [];
  for (const f of raw) {
    if (!f || typeof f !== "object") continue;
    const r = f as Record<string, unknown>;
    const path = (r.path as string) ?? (r.filePath as string) ?? (r.file as string);
    const newContent = (r.newContent as string) ?? (r.after as string) ?? (r.content as string);
    if (path && typeof newContent === "string") files.push({ path, newContent });
  }
  return files.length > 0 ? files : null;
}

/** Content pipeline artifacts are keyed by the agent's own assetId — upsert
 * so later stages update the same row instead of creating a new one. Fields
 * omitted from `fields` are left untouched on an existing row (Postgres
 * upsert only sets the columns present in the payload). */
async function upsertContentItem(
  siteId: string,
  assetId: string,
  sessionId: string,
  fields: Record<string, unknown>,
) {
  await supabase()
    .from("content_items")
    .upsert(
      { site_id: siteId, asset_id: assetId, session_id: sessionId, updated_at: new Date().toISOString(), ...fields },
      { onConflict: "site_id,asset_id" },
    );
}

/**
 * Routes parsed artifacts from a finished run into the schema-v4 tables.
 * Best-effort per artifact — one bad row never blocks the rest, and this
 * whole pass never throws (the webhook must always 200 regardless).
 *
 * Coverage today: SearchFinding/DataQualityFinding/ContentOpportunity →
 * `findings`; ExperimentPlan/ExperimentObservation/OptimizationOutcome →
 * `experiments`; OptimizationImplementationRequest/ContentPublishingRequest →
 * inserts a placeholder `approvals` row (kind "proposal", no pr_number yet)
 * so "proposal prepared" is visible as soon as a specialist hands work to
 * the Site Experience Engineer, not only once a PR exists; ImplementationProposal
 * → for GitHub sites with real file content, opens the actual branch/PR
 * itself via `openProposalPR` (the site owner's own token, never the agent's
 * shared GitHub MCP connector) and enriches that same row (matched by
 * session_id) with diff/risk/rollback/pr_number, or inserts a new row if no
 * placeholder/PR-bridge row exists yet; ReadinessGap → activity log (it's the agent explaining why nothing else
 * was produced, not a dashboard row). ContentBrief/ArticleDraft/MediaRequest/
 * QualityReview/EditorialCalendarItem → upsert into `content_items`, keyed
 * by the artifact's own `assetId` (schema-v5) so later stages update the
 * same pipeline row instead of creating a new one. Everything else
 * (ClaimLedger, SiteDNA, ImplementationPlan, RepositoryPatch, VisualReview,
 * ValidationReport, PostPublishValidation, EngineeringReadiness,
 * RevertImplementationRequest, WordPressDraftProposal, HostedBlogProposal)
 * has no dedicated table yet — logged to activity_log with its
 * decisionSummary so nothing silently vanishes.
 */
export async function ingestArtifacts(
  siteId: string,
  sessionId: string,
  sourceAgent: "content_growth" | "search_optimization" | "site_experience" | "supervisor",
  artifacts: ParsedArtifact[],
): Promise<{ ingested: number; skipped: number }> {
  let ingested = 0;
  let skipped = 0;

  for (const a of artifacts) {
    try {
      if (FINDING_TYPES.has(a.artifactType)) {
        await supabase()
          .from("findings")
          .insert({
            site_id: siteId,
            source_agent: sourceAgent === "content_growth" ? "content_growth" : "search_optimization",
            artifact_type: a.artifactType,
            asset_id: assetIdOf(a),
            category: (a.category as string) ?? null,
            severity: normalizeSeverity(a),
            confidence: normalizeConfidence(a.confidence),
            title: (a.title as string) ?? (a.decisionSummary as string) ?? a.artifactType,
            summary: (a.decisionSummary as string) ?? null,
            evidence: a.evidence ?? a.sourceRefs ?? [],
            affected_urls: affectedUrlsOf(a),
            recommended_action:
              (a.recommendedAction as string) ?? (a.recommended_action as string) ?? (a.recommendation as string) ?? null,
            session_id: sessionId,
          });
        ingested++;
      } else if (a.artifactType === "ExperimentPlan") {
        await supabase()
          .from("experiments")
          .insert({
            site_id: siteId,
            hypothesis: (a.hypothesis as string) ?? (a.decisionSummary as string) ?? "Untitled experiment",
            primary_metric: (a.primaryMetric as string) ?? (a.primary_metric as string) ?? "unspecified",
            secondary_metrics: (a.secondaryMetrics as string[]) ?? [],
            status: "planned",
            observation_window: (a.observationWindow as string) ?? (a.observation_window as string) ?? null,
            evidence: a.evidence ?? [],
            session_id: sessionId,
          });
        ingested++;
      } else if (a.artifactType === "ExperimentObservation" || a.artifactType === "OptimizationOutcome") {
        const outcome = (a.recommendation as string) ?? (a.outcome as string) ?? null;
        const status =
          outcome && ["keep", "iterate", "revert", "inconclusive"].includes(String(outcome).toLowerCase())
            ? String(outcome).toLowerCase()
            : "inconclusive";
        const { data: running } = await supabase()
          .from("experiments")
          .select("id")
          .eq("site_id", siteId)
          .eq("status", "running")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (running) {
          await supabase()
            .from("experiments")
            .update({ status, decided_at: new Date().toISOString(), evidence: a.evidence ?? [] })
            .eq("id", running.id);
          ingested++;
        } else {
          skipped++; // no matching running experiment to attach this outcome to
        }
      } else if (a.artifactType === "ImplementationProposal") {
        const { data: approval } = await supabase()
          .from("approvals")
          .select("id")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const reviewFields: Record<string, unknown> = {
          diff_summary: a.diff ?? a.diffSummary ?? null,
          screenshots: a.screenshots ?? null,
          // Verified live: the field is `lighthouseComparison`, not `lighthouse`.
          lighthouse: (a.lighthouseComparison as unknown) ?? (a.lighthouse as unknown) ?? null,
          risk: riskClassificationOf(a),
          confidence: normalizeConfidence(a.confidence),
          rollback_plan: rollbackPlanTextOf(a),
        };

        // Open the real PR ourselves, using the SITE OWNER'S OWN GitHub
        // token (openProposalPR/siteTokenOf) — never the agent's own GitHub
        // MCP connector, which is one shared credential across every
        // customer and can't safely hold write access to an arbitrary repo.
        // The agent's job ends at reporting the diff.
        const files = proposalFilesOf(a);
        if (files) {
          const site = await getSiteById(siteId);
          if (site && (site.platform ?? "github") === "github" && site.github_repo) {
            try {
              const assetId = assetIdOf(a);
              const branchName = `seo-agent/${assetId ?? sessionId.slice(0, 12)}`;
              const title = (a.title as string) ?? (a.decisionSummary as string) ?? "SEO Forge proposal";
              const pr = await openProposalPR(site, {
                branchName,
                title,
                body: [
                  (a.decisionSummary as string) ?? "Proposed by the SEO Forge agent team.",
                  "",
                  "Review the diff, then approve or reject from the SEO Forge Production dashboard",
                  "(or directly here). Merging deploys via your pipeline.",
                ].join("\n"),
                files,
              });
              reviewFields.pr_number = pr.prNumber;
              reviewFields.repo = `${site.github_repo}`;
              reviewFields.kind = "pr";
              reviewFields.status = "pending";
            } catch (e) {
              // Couldn't open the PR (permissions, conflict, etc.) — still
              // record the proposal below so the diff/review detail isn't lost.
              await logActivity(
                siteId,
                "agent",
                `Could not open PR for proposal: ${e instanceof Error ? e.message : "unknown error"}`,
              );
            }
          }
        }

        if (approval) {
          await supabase().from("approvals").update(reviewFields).eq("id", approval.id);
        } else {
          // No placeholder row from an earlier handoff artifact (e.g. a direct
          // siteExperience run) — create the proposal row now instead of
          // dropping the artifact.
          await supabase()
            .from("approvals")
            .insert({
              site_id: siteId,
              title: (a.title as string) ?? (a.decisionSummary as string) ?? "Implementation proposal",
              kind: "proposal",
              status: "pending",
              detail: (a.decisionSummary as string) ?? null,
              session_id: sessionId,
              // No database finding_id field exists on real artifacts — the
              // agent only knows its own assetId (verified live).
              finding_id: await findFindingIdByAsset(siteId, assetIdOf(a)),
              ...reviewFields,
            });
        }
        ingested++;
      } else if (a.artifactType === "OptimizationImplementationRequest" || a.artifactType === "ContentPublishingRequest") {
        // Handoff to the Site Experience Engineer — make "proposal prepared"
        // visible immediately instead of only after a PR/WordPress change
        // exists. The later ImplementationProposal (above) and PR bridge
        // (webhook/github-sync routes) enrich this same row by session_id.
        await supabase()
          .from("approvals")
          .insert({
            site_id: siteId,
            title: (a.title as string) ?? (a.decisionSummary as string) ?? a.artifactType,
            kind: "proposal",
            status: "pending",
            detail: (a.decisionSummary as string) ?? (a.recommendedAction as string) ?? (a.recommendation as string) ?? null,
            session_id: sessionId,
            finding_id: await findFindingIdByAsset(siteId, assetIdOf(a)),
          });
        ingested++;
      } else if (a.artifactType === "ContentBrief") {
        const assetId = assetIdOf(a);
        if (!assetId) {
          skipped++; // no assetId to key the pipeline row on
        } else {
          await upsertContentItem(siteId, assetId, sessionId, {
            // Verified live: ContentBrief carries `workingTitle`/`primaryTopic`,
            // not `title`/`targetKeyword` — kept those as a fallback in case a
            // future schema version renames the fields.
            title: (a.workingTitle as string) ?? (a.title as string) ?? (a.decisionSummary as string) ?? null,
            target_keyword: (a.primaryTopic as string) ?? (a.targetKeyword as string) ?? (a.target_keyword as string) ?? null,
            stage: "brief",
            brief: a,
          });
          ingested++;
        }
      } else if (a.artifactType === "ArticleDraft") {
        const assetId = assetIdOf(a);
        if (!assetId) {
          skipped++;
        } else {
          await upsertContentItem(siteId, assetId, sessionId, {
            stage: "drafting",
            draft: a,
          });
          ingested++;
        }
      } else if (a.artifactType === "MediaRequest") {
        const assetId = assetIdOf(a);
        if (!assetId) {
          skipped++;
        } else {
          const { data: existing } = await supabase()
            .from("content_items")
            .select("media")
            .eq("site_id", siteId)
            .eq("asset_id", assetId)
            .maybeSingle();
          const prior = ((existing as { media: { requests?: unknown[] } } | null)?.media?.requests ?? []) as unknown[];
          await upsertContentItem(siteId, assetId, sessionId, {
            media: { requests: [...prior, a] },
          });
          ingested++;
        }
      } else if (a.artifactType === "QualityReview") {
        const assetId = assetIdOf(a);
        if (!assetId) {
          skipped++;
        } else {
          const verdict = String(a.verdict ?? a.result ?? "").toLowerCase();
          const passed = verdict.includes("pass") || verdict.includes("approve");
          await upsertContentItem(siteId, assetId, sessionId, {
            stage: passed ? "publishing_ready" : "editorial_review",
            quality: a,
          });
          ingested++;
        }
      } else if (a.artifactType === "EditorialCalendarItem") {
        const assetId = assetIdOf(a);
        const date = (a.scheduledDate as string) ?? (a.scheduled_date as string) ?? null;
        if (!assetId || !date) {
          skipped++;
        } else {
          await upsertContentItem(siteId, assetId, sessionId, { scheduled_date: date });
          ingested++;
        }
      } else if (a.artifactType === "ReadinessGap") {
        await logActivity(
          siteId,
          "agent",
          `Readiness gap: ${(a.decisionSummary as string) ?? "missing required inputs"}`,
        );
        ingested++;
      } else {
        // Unmapped artifact type — don't lose it, just don't give it a dedicated row yet.
        await logActivity(
          siteId,
          "agent",
          `${a.artifactType}: ${(a.decisionSummary as string) ?? "no summary"}`,
        );
        ingested++;
      }
    } catch {
      skipped++; // best-effort — one bad artifact never blocks the rest
    }
  }

  return { ingested, skipped };
}
