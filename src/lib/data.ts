import { supabase } from "./supabase";

export type Site = {
  id: string;
  name: string;
  url: string;
  github_repo: string | null;
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

export async function getRuns(limit = 20) {
  return safe<AgentRun[]>(async () => {
    const { data, error } = await supabase()
      .from("agent_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as AgentRun[];
  }, DEMO_RUNS);
}

export async function getApprovals(status?: string) {
  return safe<Approval[]>(async () => {
    let q = supabase().from("approvals").select("*").order("created_at", { ascending: false }).limit(50);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    return data as Approval[];
  }, DEMO_APPROVALS);
}

export async function getMedia() {
  return safe<MediaAsset[]>(async () => {
    const { data, error } = await supabase()
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return data as MediaAsset[];
  }, DEMO_MEDIA);
}

export async function getActivity(limit = 15) {
  return safe<Activity[]>(async () => {
    const { data, error } = await supabase()
      .from("activity_log")
      .select("*")
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
  { id: "r1", agent_name: "SEO Content Strategy Agent", session_id: null, kind: "serp_check", status: "done", summary: "SERP sweep: 5 keywords analyzed, 2 title rewrites recommended", created_at: iso(0, 2) },
  { id: "r2", agent_name: "Content Production Orchestrator", session_id: null, kind: "full_review", status: "done", summary: "Weekly review complete — 3 optimizations queued for approval", created_at: iso(0, 9) },
  { id: "r3", agent_name: "Article Image Generator", session_id: null, kind: "media", status: "done", summary: "4 images generated for /blog/serp-monitoring", created_at: iso(1, 3) },
  { id: "r4", agent_name: "SEO Content Writer Agent", session_id: null, kind: "content", status: "done", summary: "Refreshed intro + FAQ on 2 decaying articles", created_at: iso(2, 1) },
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
  { id: "l1", actor: "agent", message: "Strategy Agent finished SERP sweep — avg position improved 1.8 → queued 2 rewrites", created_at: iso(0, 2) },
  { id: "l2", actor: "human", message: "Approved PR #10 — internal linking pass (merged & deployed)", created_at: iso(0, 8) },
  { id: "l3", actor: "agent", message: "Image Generator produced 4 assets matching article tone (editorial, dark)", created_at: iso(1, 3) },
  { id: "l4", actor: "system", message: "Nightly review scheduled run completed in 14m", created_at: iso(1, 9) },
];
