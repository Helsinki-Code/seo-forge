import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Braces,
  Check,
  CircleCheck,
  Code2,
  Database,
  Gauge,
  GitBranch,
  Globe2,
  KeyRound,
  LineChart,
  LockKeyhole,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import type { MarketingFeature, MarketingPageSpec } from "@/lib/marketing-pages";

const iconCycle: LucideIcon[] = [Search, Sparkles, Workflow, ShieldCheck, BarChart3, GitBranch];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="marketing-shell min-h-screen overflow-hidden">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function PageHero({ page }: { page: MarketingPageSpec }) {
  return (
    <section className="marketing-hero relative border-b border-edge/80">
      <div className="marketing-orb marketing-orb-one" aria-hidden />
      <div className="marketing-orb marketing-orb-two" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-24">
        <div className="relative z-10">
          <p className="marketing-kicker"><span aria-hidden />{page.eyebrow}</p>
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
            {page.title}
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-fg-mute sm:text-xl">
            {page.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={page.primaryHref} className="marketing-button marketing-button-primary">
              {page.primaryCta}<ArrowRight size={16} aria-hidden />
            </Link>
            {page.secondaryCta && page.secondaryHref ? (
              <Link href={page.secondaryHref} className="marketing-button marketing-button-secondary">
                {page.secondaryCta}
              </Link>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-fg-mute">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-mint" />Human approval required</span>
            <span className="inline-flex items-center gap-2"><Gauge size={14} className="text-amber" />Budgets and quotas enforced</span>
            <span className="inline-flex items-center gap-2"><LineChart size={14} className="text-primary" />Measured, never guaranteed</span>
          </div>
        </div>
        <WorkflowPreview kind={page.kind} />
      </div>
    </section>
  );
}

export function WorkflowPreview({ kind = "hub" }: { kind?: MarketingPageSpec["kind"] }) {
  const focus = kind === "agent" ? "Active agent plan" : kind === "integration" ? "Scoped connection" : kind === "trust" ? "Protected workflow" : "Two-pipeline control room";
  return (
    <div className="marketing-preview relative z-10" aria-label={`Illustrative SEOForge ${focus.toLowerCase()}`}>
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-fg-faint">Illustrative product view</p>
          <p className="mt-1 text-sm font-semibold">{focus}</p>
        </div>
        <span className="status-pill"><span /> operating</span>
      </div>
      <div className="space-y-4 p-5">
        <div className="rounded-xl border border-primary/25 bg-primary/8 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="preview-icon bg-primary/15 text-primary"><Workflow size={17} /></span>
              <div><p className="text-xs font-semibold">Workflow Supervisor</p><p className="text-[11px] text-fg-faint">priorities · budgets · approvals</p></div>
            </div>
            <span className="text-[10px] text-mint">heartbeat healthy</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewCard icon={Sparkles} title="Content Growth" detail="3 opportunities ready" tone="amber" />
          <PreviewCard icon={Search} title="Search Optimization" detail="7 pages investigated" tone="primary" />
        </div>
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-fg-faint"><span className="h-px flex-1 bg-edge" />shared delivery layer<span className="h-px flex-1 bg-edge" /></div>
        <PreviewCard icon={Code2} title="Site Experience Engineer" detail="GitHub or WordPress · validated proposal" tone="mint" />
        <div className="rounded-xl border border-amber/25 bg-amber/8 p-4">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-semibold">Awaiting human approval</p><p className="mt-1 text-[11px] text-fg-faint">Evidence, exact diff, validation and rollback attached</p></div>
            <LockKeyhole size={18} className="shrink-0 text-amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ icon: Icon, title, detail, tone }: { icon: LucideIcon; title: string; detail: string; tone: "amber" | "primary" | "mint" }) {
  const styles = { amber: "bg-amber/12 text-amber", primary: "bg-primary/12 text-primary", mint: "bg-mint/12 text-mint" };
  return (
    <div className="rounded-xl border border-edge bg-panel-2/70 p-4">
      <span className={`preview-icon ${styles[tone]}`}><Icon size={17} /></span>
      <p className="mt-3 text-xs font-semibold">{title}</p>
      <p className="mt-1 text-[11px] text-fg-faint">{detail}</p>
    </div>
  );
}

export function TrustStrip() {
  const items = [
    [GitBranch, "GitHub"],
    [Globe2, "WordPress"],
    [Search, "Search Console"],
    [BarChart3, "GA4"],
    [Database, "DataForSEO"],
    [MessageSquareText, "Slack"],
  ] as const;
  return (
    <section className="border-b border-edge/80 bg-panel/40" aria-label="Supported provider workflows">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-9 gap-y-4 px-6 py-7 text-xs text-fg-faint">
        <span className="mr-2 uppercase tracking-[0.18em]">Connects with</span>
        {items.map(([Icon, label]) => <span key={label} className="inline-flex items-center gap-2 text-fg-mute"><Icon size={15} />{label}</span>)}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, body, align = "left" }: { eyebrow: string; title: string; body?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-5xl">{title}</h2>
      {body ? <p className="mt-5 text-pretty text-base leading-7 text-fg-mute sm:text-lg">{body}</p> : null}
    </div>
  );
}

export function FeatureGrid({ features }: { features: MarketingFeature[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <SectionHeading eyebrow="What the system does" title="Continuous work with an accountable outcome." body="The interface is designed around evidence, ownership and production state—not a collection of disconnected AI chat boxes." />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = iconCycle[index % iconCycle.length];
          return (
            <article key={feature.title} className="marketing-card group min-h-64 p-6 sm:p-8">
              <div className="marketing-card-grid" aria-hidden />
              <span className="preview-icon relative bg-primary/12 text-primary"><Icon size={18} /></span>
              <p className="relative mt-16 text-xs uppercase tracking-[0.16em] text-fg-faint">0{index + 1}</p>
              <h3 className="relative mt-3 text-xl font-semibold">{feature.title}</h3>
              <p className="relative mt-3 text-sm leading-6 text-fg-mute">{feature.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function PipelineSection() {
  return (
    <section className="border-y border-edge/80 bg-panel/35">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeading eyebrow="Autonomous workflow" title="Both sides of organic growth keep moving." body="The Content Growth and Search Optimization pipelines operate independently, share the delivery layer, and stay coordinated through one Supervisor." align="center" />
        <div className="relative mt-14 grid gap-5 lg:grid-cols-[1fr_12rem_1fr]">
          <PipelineCard icon={Sparkles} tone="amber" title="Content Growth" items={["Opportunity and gap research", "Clusters, briefs and calendar", "Articles, media and editorial review", "Publishing proposal and measurement"]} href="/platform/content-growth" />
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="preview-icon h-12 w-12 bg-primary/15 text-primary"><Workflow size={21} /></span>
            <p className="text-center text-xs font-semibold">Workflow<br />Supervisor</p>
            <span className="hidden h-16 w-px bg-gradient-to-b from-primary to-transparent lg:block" aria-hidden />
          </div>
          <PipelineCard icon={Search} tone="primary" title="Search Optimization" items={["Rankings, SERPs and competitors", "Technical and content health", "Links, backlinks and AI citations", "Optimization proposal and experiment"]} href="/platform/search-optimization" />
        </div>
        <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-mint/25 bg-mint/7 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3"><span className="preview-icon bg-mint/12 text-mint"><Code2 size={18} /></span><div><p className="text-sm font-semibold">Shared Site Experience Engineer</p><p className="text-xs text-fg-mute">Prepares website-native GitHub or WordPress changes.</p></div></div>
            <span className="rounded-full border border-amber/25 bg-amber/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber">human approval gate</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineCard({ icon: Icon, tone, title, items, href }: { icon: LucideIcon; tone: "amber" | "primary"; title: string; items: string[]; href: string }) {
  const styles = tone === "amber" ? "bg-amber/12 text-amber border-amber/20" : "bg-primary/12 text-primary border-primary/20";
  return (
    <article className="marketing-card p-7 sm:p-9">
      <span className={`preview-icon border ${styles}`}><Icon size={19} /></span>
      <h3 className="mt-7 text-2xl font-semibold">{title}</h3>
      <ul className="mt-6 space-y-3">
        {items.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-fg-mute"><CircleCheck size={15} className="mt-0.5 shrink-0 text-mint" />{item}</li>)}
      </ul>
      <Link href={href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-fg">Explore the pipeline <ArrowRight size={14} /></Link>
    </article>
  );
}

export function ProcessTimeline({ steps }: { steps: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <SectionHeading eyebrow="Operating sequence" title="Every run has a visible beginning, handoff and conclusion." body="SEOForge separates provider observations, agent hypotheses, human decisions and measured outcomes so the dashboard never pretends one is another." />
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="group flex gap-4 rounded-2xl border border-edge bg-panel/65 p-5 transition hover:border-edge-2">
              <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <div><p className="text-sm font-semibold">{step}</p><p className="mt-1.5 text-xs leading-5 text-fg-faint">Status, evidence, owner, reserved usage and next action remain visible.</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function EvidenceSection() {
  const events = [
    ["09:41:02", "provider", "Search Console observation normalized"],
    ["09:41:11", "research", "Intent and competing pages investigated"],
    ["09:42:07", "evidence", "Source URLs and capture times attached"],
    ["09:43:18", "proposal", "Minimal production change prepared"],
    ["09:44:31", "policy", "Awaiting authenticated human approval"],
  ];
  return (
    <section className="border-y border-edge/80 bg-panel/35">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading eyebrow="Evidence stream" title="Watch the work without exposing private chain-of-thought." body="The activity view shows the current stage, tool, target, evidence, concise decision summary, usage, retries and recovery status." />
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
            {["Current URL or query", "Provider and tool", "Evidence and timestamp", "Retry and cost state"].map((item) => <div key={item} className="rounded-xl border border-edge bg-panel p-4 text-fg-mute"><Check size={14} className="mb-3 text-mint" />{item}</div>)}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-edge bg-[#07090d] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-edge px-5 py-3"><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose/70" /><span className="h-2.5 w-2.5 rounded-full bg-amber/70" /><span className="h-2.5 w-2.5 rounded-full bg-mint/70" /></div><span className="text-[10px] uppercase tracking-[0.18em] text-fg-faint">illustrative activity</span></div>
          <div className="space-y-1 p-5 font-mono text-[11px] sm:p-6">
            {events.map(([time, type, event]) => <div key={time} className="grid grid-cols-[4.5rem_5.5rem_1fr] gap-2 rounded-lg px-2 py-2.5 hover:bg-white/[0.03]"><span className="text-fg-faint">{time}</span><span className="text-primary">{type}</span><span className="text-fg-mute">{event}</span></div>)}
            <div className="mt-4 flex items-center gap-2 border-t border-edge pt-4 text-amber"><span className="h-2 w-2 animate-pulse rounded-full bg-amber" />production authority remains locked</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MeasurementSection() {
  const metrics = [
    ["Technical health", "Crawl, indexability, schema and performance"],
    ["Search visibility", "Keywords, SERP features and competitor movement"],
    ["Organic outcomes", "Clicks, sessions, conversions and revenue"],
    ["AI visibility", "Approved probes, responses and citations"],
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <SectionHeading eyebrow="Measurement" title="The dashboard labels facts, forecasts and hypotheses differently." body="SEOForge connects production annotations to later search and conversion observations while preserving uncertainty and external search-engine control." align="center" />
      <div className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="marketing-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5"><div><p className="text-sm font-semibold">Visibility observation window</p><p className="mt-1 text-xs text-fg-faint">Illustrative chart—not customer results</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] text-primary">measured</span></div>
          <div className="mt-10 flex h-48 items-end gap-2 border-b border-l border-edge px-4 pb-0">
            {[25, 32, 29, 44, 48, 54, 51, 63, 69, 73, 78, 84].map((height, index) => <span key={index} className="flex-1 rounded-t bg-gradient-to-t from-primary/25 to-primary" style={{ height: `${height}%` }} />)}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-fg-faint"><span>baseline</span><span className="text-amber">deployment annotation</span><span>observation end</span></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {metrics.map(([title, body], index) => <div key={title} className="rounded-2xl border border-edge bg-panel p-5"><div className="flex items-center gap-3"><span className="preview-icon bg-primary/10 text-primary">{index === 0 ? <Wrench size={16} /> : index === 1 ? <Search size={16} /> : index === 2 ? <BarChart3 size={16} /> : <Bot size={16} />}</span><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] text-fg-faint">{body}</p></div></div></div>)}
        </div>
      </div>
    </section>
  );
}

export function IntegrationSection({ integrations }: { integrations: string[] }) {
  const icons = [GitBranch, Globe2, BarChart3, Search, Database, Braces, MessageSquareText, KeyRound];
  return (
    <section className="border-y border-edge/80 bg-panel/35">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeading eyebrow="Connected workflow" title="Provider access stays scoped, visible and revocable." body="Connection health cards explain what data is current, which permissions are active and which workflows are affected by a failure." align="center" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((integration, index) => { const Icon = icons[index % icons.length]; return <div key={integration} className="group rounded-2xl border border-edge bg-panel p-5 transition hover:-translate-y-1 hover:border-primary/40"><span className="preview-icon bg-primary/10 text-primary"><Icon size={17} /></span><p className="mt-5 text-sm font-semibold">{integration}</p><p className="mt-1 text-[11px] text-mint">connection-aware</p></div>; })}
        </div>
        <div className="mt-9 text-center"><Link href="/integrations" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-fg">Explore integrations <ArrowRight size={14} /></Link></div>
      </div>
    </section>
  );
}

export function FaqSection({ faqs }: { faqs: MarketingPageSpec["faqs"] }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[.75fr_1.25fr]">
      <SectionHeading eyebrow="Questions" title="Clear answers before you connect production." body="If a workflow, integration or plan boundary is unclear, book a walkthrough before subscribing." />
      <div className="divide-y divide-edge rounded-2xl border border-edge bg-panel/65 px-5 sm:px-7">
        {faqs.map((faq, index) => <details key={faq.question} className="group py-5" open={index === 0}><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold"><span>{faq.question}</span><span className="display text-primary transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-4 text-sm leading-6 text-fg-mute">{faq.answer}</p></details>)}
      </div>
    </section>
  );
}

export function RelatedSection({ links }: { links: MarketingPageSpec["related"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
      <div className="grid gap-3 md:grid-cols-3">
        {links.map((link, index) => <Link key={link.href} href={link.href} className="group flex min-h-28 items-center justify-between gap-5 rounded-2xl border border-edge bg-panel p-5 transition hover:border-primary/40"><div><p className="text-[10px] uppercase tracking-[0.16em] text-fg-faint">Next 0{index + 1}</p><p className="mt-2 text-sm font-semibold">{link.label}</p></div><ArrowRight size={17} className="text-primary transition group-hover:translate-x-1" /></Link>)}
      </div>
    </section>
  );
}

export function FinalCta({ title = "Put both SEO pipelines to work on your website.", body = "Choose a paid plan, connect your site and providers, complete readiness checks and keep final production authority in your hands." }: { title?: string; body?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
      <div className="marketing-cta relative overflow-hidden rounded-3xl border border-primary/25 p-8 sm:p-12 lg:p-16">
        <div className="marketing-orb marketing-orb-three" aria-hidden />
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Paid deployment · no free trial</p>
          <h2 className="mt-5 text-balance text-3xl font-semibold sm:text-5xl">{title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-fg-mute">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/pricing" className="marketing-button marketing-button-primary">Choose Your Plan <ArrowRight size={16} /></Link><Link href="/demo" className="marketing-button marketing-button-secondary">Book a Demo</Link></div>
        </div>
      </div>
    </section>
  );
}

export default function MarketingPage({ page }: { page: MarketingPageSpec }) {
  return (
    <MarketingShell>
      <PageHero page={page} />
      <TrustStrip />
      {page.kind === "hub" || page.kind === "agent" || page.kind === "feature" || page.kind === "trust" ? <PipelineSection /> : null}
      <FeatureGrid features={page.features} />
      <ProcessTimeline steps={page.steps} />
      <EvidenceSection />
      <MeasurementSection />
      <IntegrationSection integrations={page.integrations} />
      <FaqSection faqs={page.faqs} />
      <RelatedSection links={page.related} />
      <FinalCta />
    </MarketingShell>
  );
}
