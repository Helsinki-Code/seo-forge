-- SEO Forge — Supabase schema
-- Run this once in the Supabase SQL editor (project ufwqapkkbsdpvtsgssdj).
-- All access goes through the Next.js server behind Clerk auth, so RLS is
-- managed at the app layer. If you ever expose the anon key to untrusted
-- clients, enable RLS and add policies before doing so.

create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  github_repo text, -- e.g. "Helsinki-Code/seo-forge"
  created_at timestamptz not null default now()
);

create table if not exists keywords (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  keyword text not null,
  target_url text,
  priority int not null default 3, -- 1 = hero keyword
  created_at timestamptz not null default now()
);

create table if not exists rank_snapshots (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid references keywords(id) on delete cascade,
  position int, -- null = not in top 100
  serp_features jsonb default '{}'::jsonb,
  source text not null default 'agent', -- agent | manual | import
  checked_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  agent_name text not null,
  session_id text,
  kind text not null, -- full_review | serp_check | content | media | deploy
  status text not null default 'running', -- running | idle | done | failed
  summary text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  title text not null,
  kind text not null default 'pr', -- pr | action
  repo text,
  pr_number int,
  detail text,
  session_id text,
  status text not null default 'pending', -- pending | approved | rejected | merged
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  article_url text,
  label text,
  image_url text,
  alt_text text,
  status text not null default 'generated', -- generated | approved | published
  created_at timestamptz not null default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  actor text not null default 'system', -- system | agent | human
  message text not null,
  created_at timestamptz not null default now()
);

-- Seed the primary site
insert into sites (name, url, github_repo)
select 'SEO Forge', 'https://seoforge.online', 'Helsinki-Code/seo-forge'
where not exists (select 1 from sites where url = 'https://seoforge.online');

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
