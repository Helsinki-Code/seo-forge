import { supabase } from "./supabase";

export type Site = {
  id: string;
  name: string;
  url: string;
  github_repo: string | null;
  user_id?: string | null;
  platform?: "github" | "wordpress";
  repo_token_enc?: string | null;
  wp_username?: string | null;
  wp_app_password_enc?: string | null;
};
export type Keyword = {
  id: string;
  keyword: string;
  target_url: string | null;
  priority: number;
};
export type RankSnapshot = {
  id: string;
  keyword_id: string;
  position: number | null;
  checked_at: string;
};
export type AgentRun = {
  id: string;
  agent_name: string;
  session_id: string | null;
  kind: string;
  status: string;
  summary: string | null;
  created_at: string;
};
export type Approval = {
  id: string;
  title: string;
  kind: string;
  repo: string | null;
  pr_number: number | null;
  detail: string | null;
  status: string;
  created_at: string;
  decided_at?: string | null;
  payload?: Record<string, unknown> | null;
  session_id?: string | null;
  // ImplementationProposal review detail (schema v4) — populated once the
  // Site Experience Engineer's proposal artifact has these fields to fill.
  diff_summary?: Record<string, unknown> | null;
  screenshots?: Record<string, unknown> | null;
  lighthouse?: Record<string, unknown> | null;
  risk?: "low" | "medium" | "high" | null;
  confidence?: number | null;
  rollback_plan?: string | null;
  finding_id?: string | null;
};
export type Finding = {
  id: string;
  site_id: string;
  source_agent: "content_growth" | "search_optimization";
  artifact_type: string;
  // The agent's own assetId (verified live) — the real correlation key
  // downstream handoff artifacts use to reference this finding; there is no
  // database finding_id the agent can know.
  asset_id?: string | null;
  category: string | null;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number | null;
  title: string;
  summary: string | null;
  evidence: unknown[];
  affected_urls: string[];
  recommended_action: string | null;
  status: "open" | "accepted" | "deferred" | "dismissed" | "duplicate";
  duplicate_of: string | null;
  assigned_to: string | null;
  resolution_history: unknown[];
  session_id: string | null;
  created_at: string;
  resolved_at: string | null;
};
export type Experiment = {
  id: string;
  site_id: string;
  finding_id: string | null;
  hypothesis: string;
  primary_metric: string;
  secondary_metrics: string[];
  status: "planned" | "running" | "keep" | "iterate" | "revert" | "inconclusive";
  observation_window: string | null;
  started_at: string | null;
  decided_at: string | null;
  evidence: unknown[];
  created_at: string;
};
export type HealthScore = {
  id: string;
  site_id: string;
  overall: number;
  category_scores: Record<string, number>;
  computed_at: string;
};
export type ProviderFreshness = {
  id: string;
  site_id: string;
  provider: "dataforseo" | "firecrawl" | "ga4" | "github" | "fal_ai";
  status: "fresh" | "stale" | "error" | "unknown";
  last_synced_at: string | null;
  detail: string | null;
};
export type CompetitorObservation = {
  id: string;
  competitor_domain: string;
  keyword: string | null;
  engine: string;
  metric: string;
  value: unknown;
  captured_at: string;
};
export type AiCitationObservation = {
  id: string;
  engine: "ai_overview" | "chatgpt" | "perplexity" | "bing_copilot";
  query: string;
  cited: boolean;
  cited_url: string | null;
  is_synthetic_probe: boolean;
  captured_at: string;
};
export const CONTENT_STAGES = [
  "brief",
  "drafting",
  "editorial_review",
  "publishing_ready",
  "published",
  "measuring",
] as const;
export type ContentStage = (typeof CONTENT_STAGES)[number];

export type ContentItem = {
  id: string;
  site_id: string;
  asset_id: string;
  title: string | null;
  target_keyword: string | null;
  stage: ContentStage;
  brief: Record<string, unknown> | null;
  draft: Record<string, unknown> | null;
  media: Record<string, unknown> | null;
  quality: Record<string, unknown> | null;
  scheduled_date: string | null;
  published_url: string | null;
  finding_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
};
export type MediaAsset = {
  id: string;
  article_url: string | null;
  label: string | null;
  image_url: string | null;
  alt_text: string | null;
  status: string;
  created_at: string;
};
export type Activity = {
  id: string;
  actor: string;
  message: string;
  created_at: string;
};

/** Wraps a Supabase query; returns fallback + demo flag when the DB
 *  isn't reachable or the schema hasn't been applied yet. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<{ data: T; demo: boolean }> {
  try {
    const data = await fn();
    return { data, demo: false };
  } catch {
    return { data: fallback, demo: true };
  }
}

export async function getSite() {
  return safe<Site | null>(async () => {
    const { data, error } = await supabase().from("sites").select("*").limit(1).single();
    if (error) throw error;
    return data as Site;
  }, {
    id: "demo",
    name: "SEO Forge",
    url: "https://seoforge.online",
    github_repo: "Helsinki-Code/seo-forge",
  });
}

/** The signed-in user's connected site (multi-tenant). null = not connected yet. */
export async function getUserSite(
  userId: string,
): Promise<{ site: Site | null; demo: boolean }> {
  try {
    const { data, error } = await supabase()
      .from("sites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1);
    if (error) throw error;
    return { site: (data?.[0] as Site) ?? null, demo: false };
  } catch {
    // DB unreachable / schema missing — show demo so the UI stays alive
    return {
      site: {
        id: "demo",
        name: "SEO Forge (demo)",
        url: "https://seoforge.online",
        github_repo: "Helsinki-Code/seo-forge",
        platform: "github",
      },
      demo: true,
    };
  }
}

export async function getSiteById(siteId: string): Promise<Site | null> {
  try {
    const { data, error } = await supabase().from("sites").select("*").eq("id", siteId).single();
    if (error) throw error;
    return data as Site;
  } catch {
    return null;
  }
}

export async function getKeywords(siteId: string) {
  return safe<Keyword[]>(async () => {
    const { data, error } = await supabase()
      .from("keywords")
      .select("*")
      .eq("site_id", siteId)
      .order("priority");
    if (error) throw error;
    return data as Keyword[];
  }, DEMO_KEYWORDS);
}

export async function getSnapshots(keywordIds: string[]) {
  return safe<RankSnapshot[]>(async () => {
    const { data, error } = await supabase()
      .from("rank_snapshots")
      .select("*")
      .in("keyword_id", keywordIds)
      .order("checked_at", { ascending: true })
      .limit(500);
    if (error) throw error;
    return data as RankSnapshot[];
  }, DEMO_SNAPSHOTS);
}

export async function getRuns(siteId: string, limit = 20) {
  return safe<AgentRun[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("agent_runs")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as AgentRun[];
  }, DEMO_RUNS);
}

export async function getApprovals(siteId: string, status?: string) {
  return safe<Approval[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    let q = supabase().from("approvals").select("*").eq("site_id", siteId).order("created_at", { ascending: false }).limit(50);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    return data as Approval[];
  }, DEMO_APPROVALS);
}

export async function getMedia(siteId: string) {
  return safe<MediaAsset[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("media_assets")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return data as MediaAsset[];
  }, DEMO_MEDIA);
}

export async function getActivity(siteId: string, limit = 15) {
  return safe<Activity[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("activity_log")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as Activity[];
  }, DEMO_ACTIVITY);
}

export async function logActivity(siteId: string, actor: string, message: string) {
  try {
    await supabase().from("activity_log").insert({ site_id: siteId, actor, message });
  } catch {
    // non-fatal
  }
}

export async function getFindings(siteId: string, status?: Finding["status"]) {
  return safe<Finding[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    let q = supabase()
      .from("findings")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    return data as Finding[];
  }, DEMO_FINDINGS);
}

export const HEALTH_CATEGORIES = ["technical", "content", "links", "performance", "geo"] as const;
export type HealthCategory = (typeof HEALTH_CATEGORIES)[number];

function healthCategoryOf(finding: Pick<Finding, "category">): HealthCategory {
  const c = (finding.category ?? "").toLowerCase();
  if (c.includes("perf") || c.includes("speed") || c.includes("vital") || c.includes("cwv")) return "performance";
  if (c.includes("link")) return "links";
  if (c.includes("geo") || c.includes("citation") || c.includes("ai_overview") || c.includes("llm")) return "geo";
  if (c.includes("tech") || c.includes("crawl") || c.includes("index")) return "technical";
  return "content";
}

const HEALTH_SEVERITY_PENALTY: Record<Finding["severity"], number> = {
  critical: 25,
  high: 12,
  medium: 5,
  low: 2,
};

/**
 * Derives a live health score from currently-open findings when no
 * `seo_health_scores` snapshot has been computed yet. Every point deducted
 * traces back to a real open finding, so this is a computed metric — not a
 * fabricated one — and reads as 100 with zero open findings.
 */
export function computeHealthScoreFromFindings(findings: Finding[]): {
  overall: number;
  category_scores: Record<HealthCategory, number>;
} {
  const category_scores = Object.fromEntries(HEALTH_CATEGORIES.map((c) => [c, 100])) as Record<
    HealthCategory,
    number
  >;
  for (const f of findings) {
    if (f.status !== "open") continue;
    const cat = healthCategoryOf(f);
    category_scores[cat] = Math.max(0, category_scores[cat] - HEALTH_SEVERITY_PENALTY[f.severity]);
  }
  const overall = Math.round(
    HEALTH_CATEGORIES.reduce((sum, c) => sum + category_scores[c], 0) / HEALTH_CATEGORIES.length,
  );
  return { overall, category_scores };
}

export async function getExperiments(siteId: string, status?: Experiment["status"]) {
  return safe<Experiment[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    let q = supabase()
      .from("experiments")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    return data as Experiment[];
  }, DEMO_EXPERIMENTS);
}

export const OPTIMIZATION_STAGES = [
  "detected",
  "investigated",
  "proposal_prepared",
  "approved",
  "deployed",
  "measuring",
  "measured",
] as const;
export type OptimizationStage = (typeof OPTIMIZATION_STAGES)[number];

export type OptimizationPipelineItem = Finding & {
  stage: OptimizationStage;
  approval: Approval | null;
  experiment: Experiment | null;
};

function deriveOptimizationStage(approval: Approval | null, experiment: Experiment | null, finding: Finding): OptimizationStage {
  if (experiment) {
    if (experiment.status === "running") return "measuring";
    if (experiment.status !== "planned") return "measured"; // keep | iterate | revert | inconclusive
  }
  if (approval) {
    if (approval.status === "merged") return "deployed";
    if (approval.status === "approved") return "approved";
    return "proposal_prepared";
  }
  return finding.status === "accepted" ? "investigated" : "detected";
}

/**
 * The Search Optimization pipeline (detected → investigated → proposal
 * prepared → approved → deployed → measuring → keep/iterate/revert) derived
 * entirely from `findings` + `approvals` + `experiments`, joined by
 * `finding_id` — no dedicated pipeline table exists or is needed.
 */
export async function getOptimizationPipeline(siteId: string) {
  return safe<OptimizationPipelineItem[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data: findings, error: findingsErr } = await supabase()
      .from("findings")
      .select("*")
      .eq("site_id", siteId)
      .eq("source_agent", "search_optimization")
      .in("status", ["open", "accepted"])
      .order("created_at", { ascending: false })
      .limit(100);
    if (findingsErr) throw findingsErr;
    const rows = (findings ?? []) as Finding[];
    const findingIds = rows.map((f) => f.id);
    if (findingIds.length === 0) return [];

    const [{ data: approvals, error: approvalsErr }, { data: experiments, error: experimentsErr }] =
      await Promise.all([
        supabase()
          .from("approvals")
          .select("*")
          .in("finding_id", findingIds)
          .order("created_at", { ascending: false }),
        supabase()
          .from("experiments")
          .select("*")
          .in("finding_id", findingIds)
          .order("created_at", { ascending: false }),
      ]);
    if (approvalsErr) throw approvalsErr;
    if (experimentsErr) throw experimentsErr;

    const approvalByFinding = new Map<string, Approval>();
    for (const a of (approvals ?? []) as Approval[]) {
      if (a.finding_id && !approvalByFinding.has(a.finding_id)) approvalByFinding.set(a.finding_id, a);
    }
    const experimentByFinding = new Map<string, Experiment>();
    for (const e of (experiments ?? []) as Experiment[]) {
      if (e.finding_id && !experimentByFinding.has(e.finding_id)) experimentByFinding.set(e.finding_id, e);
    }

    return rows.map((f) => {
      const approval = approvalByFinding.get(f.id) ?? null;
      const experiment = experimentByFinding.get(f.id) ?? null;
      return { ...f, approval, experiment, stage: deriveOptimizationStage(approval, experiment, f) };
    });
  }, DEMO_OPTIMIZATION_PIPELINE);
}

/** The Content Growth pipeline — one row per content asset, keyed by the
 * agent's own assetId, populated by `ingestArtifacts` as brief/draft/media/
 * quality artifacts arrive (schema-v5). */
export async function getContentPipeline(siteId: string) {
  return safe<ContentItem[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("content_items")
      .select("*")
      .eq("site_id", siteId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data as ContentItem[];
  }, DEMO_CONTENT_ITEMS);
}

/** Most recent SEO Health Score snapshot for the site, or null if none computed yet. */
export async function getHealthScore(siteId: string) {
  return safe<HealthScore | null>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("seo_health_scores")
      .select("*")
      .eq("site_id", siteId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as HealthScore) ?? null;
  }, DEMO_HEALTH_SCORE);
}

export async function getProviderFreshness(siteId: string) {
  return safe<ProviderFreshness[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("provider_freshness")
      .select("*")
      .eq("site_id", siteId);
    if (error) throw error;
    return data as ProviderFreshness[];
  }, DEMO_PROVIDER_FRESHNESS);
}

export async function getCompetitorObservations(siteId: string, limit = 50) {
  return safe<CompetitorObservation[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("competitor_observations")
      .select("*")
      .eq("site_id", siteId)
      .order("captured_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as CompetitorObservation[];
  }, DEMO_COMPETITOR_OBSERVATIONS);
}

export async function getAiCitationObservations(siteId: string, limit = 50) {
  return safe<AiCitationObservation[]>(async () => {
    if (siteId === "demo") throw new Error("demo");
    const { data, error } = await supabase()
      .from("ai_citation_observations")
      .select("*")
      .eq("site_id", siteId)
      .order("captured_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as AiCitationObservation[];
  }, DEMO_AI_CITATION_OBSERVATIONS);
}

/* ---------- demo fallbacks (shown until schema.sql is applied) ---------- */

const now = Date.now();
const iso = (daysAgo: number, h = 0) => new Date(now - daysAgo * 864e5 - h * 36e5).toISOString();

const DEMO_KEYWORDS: Keyword[] = [
  { id: "k1", keyword: "ai seo automation", target_url: "/blog/ai-seo-automation", priority: 1 },
  { id: "k2", keyword: "autonomous seo agents", target_url: "/blog/autonomous-seo-agents", priority: 1 },
  { id: "k3", keyword: "programmatic content strategy", target_url: "/blog/programmatic-content", priority: 2 },
  { id: "k4", keyword: "serp monitoring tools", target_url: "/blog/serp-monitoring", priority: 2 },
  { id: "k5", keyword: "internal linking automation", target_url: "/blog/internal-linking", priority: 3 },
];

const DEMO_SNAPSHOTS: RankSnapshot[] = ["k1", "k2", "k3", "k4", "k5"].flatMap((k, i) =>
  Array.from({ length: 14 }, (_, d) => ({
    id: `${k}-${d}`,
    keyword_id: k,
    position: Math.max(1, Math.round(28 - d * (1.6 - i * 0.2) + (d % 3))),
    checked_at: iso(13 - d),
  })),
);

const DEMO_RUNS: AgentRun[] = [
  { id: "r1", agent_name: "SEOForge Search Optimization Agent", session_id: null, kind: "serp_check", status: "done", summary: "SERP sweep: 5 keywords analyzed, 2 title rewrites recommended", created_at: iso(0, 2) },
  { id: "r2", agent_name: "SEOForge Workflow Supervisor", session_id: null, kind: "full_review", status: "done", summary: "Weekly review complete — 3 optimizations queued for approval", created_at: iso(0, 9) },
  { id: "r3", agent_name: "SEOForge Content Growth Agent", session_id: null, kind: "media", status: "done", summary: "4 images generated for /blog/serp-monitoring", created_at: iso(1, 3) },
  { id: "r4", agent_name: "SEOForge Content Growth Agent", session_id: null, kind: "content", status: "done", summary: "Refreshed intro + FAQ on 2 decaying articles", created_at: iso(2, 1) },
];

const DEMO_APPROVALS: Approval[] = [
  { id: "a1", title: "Rewrite title + meta on /blog/serp-monitoring", kind: "pr", repo: "Helsinki-Code/seo-forge", pr_number: 12, detail: "CTR title from SERP analysis; meta trimmed to 156 chars.", status: "pending", created_at: iso(0, 4) },
  { id: "a2", title: "Add internal links hub→spokes (5 pages)", kind: "pr", repo: "Helsinki-Code/seo-forge", pr_number: 11, detail: "Links the pillar page to all five spoke articles with descriptive anchors.", status: "pending", created_at: iso(0, 7) },
  { id: "a3", title: "Publish 2 new images on /blog/ai-seo-automation", kind: "action", repo: null, pr_number: null, detail: "Hero + comparison diagram, alt text included.", status: "approved", created_at: iso(1, 5) },
];

const DEMO_MEDIA: MediaAsset[] = [
  { id: "m1", article_url: "/blog/ai-seo-automation", label: "Featured/Hero", image_url: null, alt_text: "Autonomous AI agents optimizing a website's SEO in real time", status: "generated", created_at: iso(0, 6) },
  { id: "m2", article_url: "/blog/serp-monitoring", label: "Step 3 diagram", image_url: null, alt_text: "SERP feature tracking dashboard with position history", status: "approved", created_at: iso(1, 2) },
];

const DEMO_ACTIVITY: Activity[] = [
  { id: "l1", actor: "agent", message: "Search Optimization Agent finished SERP sweep — avg position improved 1.8 → queued 2 rewrites", created_at: iso(0, 2) },
  { id: "l2", actor: "human", message: "Approved PR #10 — internal linking pass (merged & deployed)", created_at: iso(0, 8) },
  { id: "l3", actor: "agent", message: "Content Growth Agent produced 4 media assets matching article tone (editorial, dark)", created_at: iso(1, 3) },
  { id: "l4", actor: "system", message: "Nightly review scheduled run completed in 14m", created_at: iso(1, 9) },
];

const DEMO_FINDINGS: Finding[] = [
  {
    id: "f1", site_id: "demo", source_agent: "search_optimization", artifact_type: "SearchFinding",
    category: "technical", severity: "high", confidence: 0.86,
    title: "LCP regressed on /blog/serp-monitoring after last deploy",
    summary: "Field LCP moved from 2.1s to 3.4s on mobile following the hero-image change in PR #10.",
    evidence: [{ source: "crux", metric: "LCP", before: 2.1, after: 3.4, device: "mobile" }],
    affected_urls: ["/blog/serp-monitoring"], recommended_action: "Add explicit width/height and a preload hint for the hero image.",
    status: "open", duplicate_of: null, assigned_to: null, resolution_history: [], session_id: null,
    created_at: iso(0, 3), resolved_at: null,
  },
  {
    id: "f2", site_id: "demo", source_agent: "content_growth", artifact_type: "ContentOpportunity",
    category: "content", severity: "medium", confidence: 0.71,
    title: "Comparison page gap: \"AI SEO automation vs manual SEO\"",
    summary: "Competitors rank for this comparison intent; no equivalent page exists on the site.",
    evidence: [{ source: "dataforseo", query: "ai seo automation vs manual seo", competitors_ranking: 3 }],
    affected_urls: [], recommended_action: "Create a comparison page grounded in the site's own product positioning.",
    status: "open", duplicate_of: null, assigned_to: null, resolution_history: [], session_id: null,
    created_at: iso(0, 6), resolved_at: null,
  },
  {
    id: "f3", site_id: "demo", source_agent: "search_optimization", artifact_type: "SearchFinding",
    category: "links", severity: "low", confidence: 0.64,
    title: "Orphan page: /blog/internal-linking has no inbound internal links",
    summary: "Page ranks but receives no internal link equity from the pillar or related spokes.",
    evidence: [{ source: "crawl", inbound_internal_links: 0 }],
    affected_urls: ["/blog/internal-linking"], recommended_action: "Link from the pillar page and 2 related spokes with descriptive anchors.",
    status: "accepted", duplicate_of: null, assigned_to: null, resolution_history: [{ at: iso(0, 1), action: "accepted", by: "human" }],
    session_id: null, created_at: iso(1, 2), resolved_at: iso(0, 1),
  },
];

const DEMO_EXPERIMENTS: Experiment[] = [
  {
    id: "e1", site_id: "demo", finding_id: "f1",
    hypothesis: "Fixing the hero-image LCP regression restores organic CTR on /blog/serp-monitoring to its pre-deploy baseline.",
    primary_metric: "LCP (field, mobile)", secondary_metrics: ["organic_ctr", "bounce_rate"],
    status: "running", observation_window: "14 days or 2,000 sessions, whichever comes first",
    started_at: iso(0, 1), decided_at: null, evidence: [], created_at: iso(0, 1),
  },
];

const DEMO_OPTIMIZATION_PIPELINE: OptimizationPipelineItem[] = [
  { ...DEMO_FINDINGS[0], approval: null, experiment: DEMO_EXPERIMENTS[0], stage: "measuring" },
  { ...DEMO_FINDINGS[2], approval: null, experiment: null, stage: "investigated" },
];

const DEMO_CONTENT_ITEMS: ContentItem[] = [
  {
    id: "ci1", site_id: "demo", asset_id: "asset-comparison-page",
    title: "AI SEO Automation vs Manual SEO", target_keyword: "ai seo automation vs manual seo",
    stage: "drafting", brief: { angle: "buyer-stage comparison" }, draft: { word_count: 1400 },
    media: null, quality: null, scheduled_date: iso(-2), published_url: null,
    finding_id: "f2", session_id: null, created_at: iso(0, 5), updated_at: iso(0, 1),
  },
  {
    id: "ci2", site_id: "demo", asset_id: "asset-internal-linking-refresh",
    title: "Internal Linking Automation — refreshed guide", target_keyword: "internal linking automation",
    stage: "editorial_review", brief: { angle: "refresh with new examples" }, draft: { word_count: 1800 },
    media: { requests: [{ label: "hero" }] }, quality: null, scheduled_date: null, published_url: null,
    finding_id: null, session_id: null, created_at: iso(1, 0), updated_at: iso(0, 3),
  },
];

const DEMO_HEALTH_SCORE: HealthScore | null = {
  id: "h1", site_id: "demo", overall: 78,
  category_scores: { technical: 82, content: 74, links: 69, performance: 71, geo: 65 },
  computed_at: iso(0, 2),
};

const DEMO_PROVIDER_FRESHNESS: ProviderFreshness[] = [
  { id: "p1", site_id: "demo", provider: "dataforseo", status: "fresh", last_synced_at: iso(0, 1), detail: null },
  { id: "p2", site_id: "demo", provider: "firecrawl", status: "fresh", last_synced_at: iso(0, 2), detail: null },
  { id: "p3", site_id: "demo", provider: "ga4", status: "stale", last_synced_at: iso(3, 0), detail: "Refresh token needs re-authorization" },
  { id: "p4", site_id: "demo", provider: "github", status: "fresh", last_synced_at: iso(0, 0), detail: null },
];

const DEMO_COMPETITOR_OBSERVATIONS: CompetitorObservation[] = [
  { id: "c1", competitor_domain: "rivalseo.io", keyword: "ai seo automation", engine: "google", metric: "rank", value: 2, captured_at: iso(0, 4) },
  { id: "c2", competitor_domain: "competitorstack.com", keyword: "autonomous seo agents", engine: "google", metric: "visibility_share", value: 0.34, captured_at: iso(0, 5) },
];

const DEMO_AI_CITATION_OBSERVATIONS: AiCitationObservation[] = [
  { id: "ai1", engine: "ai_overview", query: "how do autonomous seo agents work", cited: true, cited_url: "/blog/autonomous-seo-agents", is_synthetic_probe: true, captured_at: iso(0, 5) },
  { id: "ai2", engine: "perplexity", query: "best ai seo automation tools", cited: false, cited_url: null, is_synthetic_probe: true, captured_at: iso(0, 5) },
];
