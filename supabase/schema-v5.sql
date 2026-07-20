-- SEO Forge schema v5 — Content Growth pipeline.
-- Run in the Supabase SQL editor AFTER schema.sql through schema-v4.sql.
-- Additive only — nothing here drops or renames an existing table/column.

-- One row per content asset moving through the Content Growth lifecycle,
-- keyed by the agent's own `assetId` (carried on every artifact envelope)
-- so later-arriving artifacts about the same asset update this row instead
-- of creating a new one.
create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  asset_id text not null,
  title text,
  target_keyword text,
  stage text not null default 'brief'
    check (stage in ('brief', 'drafting', 'editorial_review', 'publishing_ready', 'published', 'measuring')),
  brief jsonb,
  draft jsonb,
  media jsonb,
  quality jsonb,
  scheduled_date date,
  published_url text,
  finding_id uuid references findings(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, asset_id)
);

create index if not exists content_items_site_stage_idx on content_items(site_id, stage);

-- Verified against a live diagnostic run: SearchFinding/ContentOpportunity
-- artifacts carry the agent's own `assetId`, and downstream handoff
-- artifacts (OptimizationImplementationRequest, ContentPublishingRequest,
-- ImplementationProposal) reference the SAME assetId — never a database
-- finding_id, which the agent has no way to know. This column is the real
-- join key `ingestArtifacts` uses to populate `approvals.finding_id`.
alter table findings add column if not exists asset_id text;
create index if not exists findings_site_asset_idx on findings(site_id, asset_id) where asset_id is not null;
