-- SEO Forge schema v3 — tenant-scoped Google Analytics OAuth
-- Run in the Supabase SQL editor AFTER schema.sql and schema-v2.sql.

create table if not exists google_oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  site_id uuid references sites(id) on delete cascade,
  state_hash text not null unique,
  code_verifier_enc text not null,
  return_to text not null default '/dashboard/settings',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists google_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  google_subject text not null,
  email text not null,
  refresh_token_enc text not null,
  scopes text[] not null default '{}',
  status text not null default 'active'
    check (status in ('active', 'expired', 'revoked', 'error')),
  token_expires_at timestamptz,
  last_verified_at timestamptz,
  last_error text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, google_subject)
);

create table if not exists google_resources (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  connection_id uuid not null references google_connections(id) on delete cascade,
  site_id uuid references sites(id) on delete set null,
  resource_type text not null check (resource_type in ('ga4_property')),
  external_id text not null,
  display_name text not null,
  account_id text,
  account_name text,
  metadata jsonb not null default '{}'::jsonb,
  discovered_at timestamptz not null default now(),
  selected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(connection_id, resource_type, external_id)
);

create table if not exists mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  site_id uuid not null references sites(id) on delete cascade,
  label text not null,
  token_hash text not null unique,
  token_prefix text not null,
  last_four text not null,
  scopes text[] not null default array['ga4:read'],
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists google_resources_site_type_idx
  on google_resources(site_id, resource_type)
  where site_id is not null;

create index if not exists google_oauth_states_user_expiry_idx
  on google_oauth_states(user_id, expires_at)
  where used_at is null;

create index if not exists google_connections_user_idx
  on google_connections(user_id, status);

create index if not exists google_resources_user_idx
  on google_resources(user_id, resource_type);

create index if not exists mcp_tokens_user_site_idx
  on mcp_tokens(user_id, site_id, created_at desc);

create index if not exists mcp_tokens_active_hash_idx
  on mcp_tokens(token_hash)
  where revoked_at is null;

-- Credentials are accessed only by server-side code using SUPABASE_SECRET_KEY.
-- Keep these tables private even if RLS is enabled elsewhere later.
alter table google_oauth_states enable row level security;
alter table google_connections enable row level security;
alter table google_resources enable row level security;
alter table mcp_tokens enable row level security;

revoke all on google_oauth_states from anon, authenticated;
revoke all on google_connections from anon, authenticated;
revoke all on google_resources from anon, authenticated;
revoke all on mcp_tokens from anon, authenticated;
