-- SEO Forge schema v2 — multi-tenant sites
-- Run in the Supabase SQL editor AFTER schema.sql.

alter table sites add column if not exists user_id text;
alter table sites add column if not exists platform text not null default 'github'; -- github | wordpress
alter table sites add column if not exists repo_token_enc text;       -- encrypted GitHub PAT
alter table sites add column if not exists wp_username text;          -- WordPress username
alter table sites add column if not exists wp_app_password_enc text;  -- encrypted WP application password

alter table approvals add column if not exists payload jsonb;         -- structured change (WordPress apply)

create index if not exists sites_user_idx on sites(user_id);
create index if not exists agent_runs_site_idx on agent_runs(site_id);
create index if not exists approvals_site_idx on approvals(site_id);





