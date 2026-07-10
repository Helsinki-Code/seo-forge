# SEO Forge — Autonomous SEO Mission Control

An AI application that runs an autonomous team of eight Anthropic Managed Agents to
continuously review a website, watch live SERPs and rankings, optimize content, generate
on-brand media, and ship every change through a **human-in-the-loop GitHub deploy flow**.

Live at **https://seoforge.online** · Website repo: `Helsinki-Code/seo-forge`

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router) · Tailwind v4 · 21st.dev components · Recharts |
| Auth | Clerk |
| Database | Supabase (Postgres) |
| Agents | Anthropic Managed Agents (8-agent SEO team) |
| Deploys | GitHub PRs — approve in the dashboard, merge triggers the site pipeline |
| Scheduling | Vercel Cron → `/api/cron/review` (nightly autonomous review) |
| Realtime status | Anthropic webhooks → `/api/webhooks/anthropic` |

## The agent team

Content Production Orchestrator · Primary Blogger · Product Marketing Context Builder ·
Site Architecture · SEO Content Strategy · SEO Content Writer · Article Image Generator ·
Affiliate Product Research — persisted, versioned agents on the Anthropic platform.

## Human-in-the-loop deploys

Agents never touch production. Every proposed change lands as a GitHub pull request;
the **Approvals** page lists open PRs with one-click **Approve & merge** (squash) or
**Reject**. Your repo's pipeline takes merged changes live.

## Setup

1. `npm install`
2. Env: all keys live in `.env.local` (Clerk, Supabase, Anthropic, GitHub, CRON_SECRET).
3. Apply the database schema: paste `supabase/schema.sql` into the Supabase SQL editor.
   Until then the dashboard runs in clearly-labeled demo mode.
4. `npm run dev`

## Deploy (Vercel)

```bash
vercel --prod
```

Set the same env vars in Vercel Project Settings, point `seoforge.online` at the project,
then register the Anthropic webhook (Console → Manage → Webhooks) at
`https://seoforge.online/api/webhooks/anthropic` and store the `whsec_` secret as
`ANTHROPIC_WEBHOOK_SIGNING_KEY`.

## API surface

| Route | Purpose |
|---|---|
| `POST /api/agents/run` | Start any agent with a task (Clerk-protected) |
| `GET /api/agents/runs` | Run history |
| `GET /api/github/prs` | Open PRs on the website repo |
| `POST /api/approvals` | Approve (merge) / reject a change |
| `GET/POST /api/rankings` | Keywords + rank snapshots |
| `POST /api/media` | Generate on-brand media for an article |
| `GET /api/cron/review` | Nightly autonomous review (CRON_SECRET) |
| `POST /api/webhooks/anthropic` | Agent session status events (HMAC-verified) |
