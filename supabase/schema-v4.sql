-- SEO Forge schema v4 — findings, proposal review detail, experiments,
-- health score, provider freshness, competitor/AI-citation evidence.
-- Run in the Supabase SQL editor AFTER schema.sql, schema-v2.sql, and schema-v3.sql.
-- Additive only — nothing here drops or renames an existing table/column.

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  source_agent text not null default 'search_optimization'
    check (source_agent in ('content_growth', 'search_optimization')),
  artifact_type text not null default 'SearchFinding',
  category text, -- technical | content | links | performance | geo | monetization | conversion
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high', 'critical')),
  confidence numeric, -- 0..1
  title text not null,
  summary text,
  evidence jsonb not null default '[]'::jsonb,
  affected_urls text[] not null default '{}',
  recommended_action text,
  status text not null default 'open'
    check (status in ('open', 'accepted', 'deferred', 'dismissed', 'duplicate')),
  duplicate_of uuid references findings(id) on delete set null,
  assigned_to text,
  resolution_history jsonb not null default '[]'::jsonb,
  session_id text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists findings_site_status_idx on findings(site_id, status);
create index if not exists findings_site_severity_idx on findings(site_id, severity);
create index if not exists findings_duplicate_idx on findings(duplicate_of) where duplicate_of is not null;

-- Extend the existing `approvals` table into full ImplementationProposal
-- review data instead of a second parallel table — `payload jsonb` already
-- exists there for the WordPress structured-change case.
alter table approvals add column if not exists diff_summary jsonb;
alter table approvals add column if not exists screenshots jsonb;
alter table approvals add column if not exists lighthouse jsonb;
alter table approvals add column if not exists risk text
  check (risk is null or risk in ('low', 'medium', 'high'));
alter table approvals add column if not exists confidence numeric;
alter table approvals add column if not exists rollback_plan text;
alter table approvals add column if not exists finding_id uuid references findings(id) on delete set null;

create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  finding_id uuid references findings(id) on delete set null,
  hypothesis text not null,
  primary_metric text not null,
  secondary_metrics text[] not null default '{}',
  status text not null default 'planned'
    check (status in ('planned', 'running', 'keep', 'iterate', 'revert', 'inconclusive')),
  observation_window text, -- human-readable window + stopping rule, e.g. "14 days or 2000 sessions"
  started_at timestamptz,
  decided_at timestamptz,
  evidence jsonb not null default '[]'::jsonb,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists experiments_site_status_idx on experiments(site_id, status);

create table if not exists seo_health_scores (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  overall int not null check (overall between 0 and 100),
  category_scores jsonb not null default '{}'::jsonb, -- {technical, content, links, performance, geo}
  computed_at timestamptz not null default now()
);

create index if not exists seo_health_scores_site_idx on seo_health_scores(site_id, computed_at desc);

create table if not exists provider_freshness (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  provider text not null check (provider in ('dataforseo', 'firecrawl', 'ga4', 'github', 'fal_ai')),
  status text not null default 'unknown' check (status in ('fresh', 'stale', 'error', 'unknown')),
  last_synced_at timestamptz,
  detail text,
  updated_at timestamptz not null default now(),
  unique (site_id, provider)
);

create table if not exists competitor_observations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  competitor_domain text not null,
  keyword text,
  engine text not null default 'google',
  location text,
  device text default 'desktop',
  metric text not null, -- e.g. "visibility_share" | "rank" | "serp_feature_owned"
  value jsonb not null,
  source text not null default 'dataforseo',
  captured_at timestamptz not null default now()
);

create index if not exists competitor_observations_site_idx on competitor_observations(site_id, captured_at desc);

-- Synthetic citation probes ARE controlled measurements, never real user
-- traffic — `is_synthetic_probe` must stay true until a genuinely
-- non-synthetic citation signal source exists; UI must always label these
-- as probes per the Search Optimization Agent's own policy.
create table if not exists ai_citation_observations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  engine text not null check (engine in ('ai_overview', 'chatgpt', 'perplexity', 'bing_copilot')),
  query text not null,
  cited boolean not null default false,
  cited_url text,
  snippet text,
  is_synthetic_probe boolean not null default true,
  location text,
  source text not null default 'agent_probe',
  captured_at timestamptz not null default now()
);

create index if not exists ai_citation_observations_site_idx on ai_citation_observations(site_id, captured_at desc);

-- Same access model as every other table in this app: server-side only,
-- behind Clerk auth, using SUPABASE_SECRET_KEY (see schema.sql header).
-- No RLS/policies added here to stay consistent with the existing tables;
-- revisit together if the anon key is ever exposed to untrusted clients.
