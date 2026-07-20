<<<<<<< HEAD
import Link from "next/link";
import { SignUpButton, Show } from "@clerk/nextjs";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { ArrowRight, Bot, GitPullRequest, LineChart, ShieldCheck } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Autonomous SEO Agent, Human-Approved Deploys",
  description:
    "SEO Forge's AI agent team reviews your site, tracks SERPs, and rewrites what underperforms — every change ships as a GitHub pull request you approve.",
  path: "/",
});

const features = [
  {
    icon: Bot,
    title: "Autonomous agent team",
    body: (
      <>
        <Link href="/about" className="text-primary hover:underline">
          Eight specialized agents
        </Link>{" "}
        review your site, analyze live SERPs, and optimize content around the clock.
      </>
    ),
  },
  {
    icon: LineChart,
    title: "Rankings, watched constantly",
    body: (
      <>
        Keyword positions and{" "}
        <Link href="/blog/serp-monitoring-that-actually-drives-action" className="text-primary hover:underline">
          SERP features tracked over time
        </Link>
        , with every optimization tied to a measurable move.
      </>
    ),
  },
  {
    icon: GitPullRequest,
    title: "Ship via pull request",
    body: (
      <>
        Every change lands as a{" "}
        <Link href="/how-it-works" className="text-primary hover:underline">
          GitHub PR
        </Link>
        . Nothing goes live without your approval — one click merges and deploys.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "On-brand media, always",
    body: (
      <>
        Images and assets generated to{" "}
        <Link href="/blog/on-brand-images-at-scale" className="text-primary hover:underline">
          match the tone and style
        </Link>{" "}
        of the articles they belong to.
      </>
    ),
  },
];

const faqs = [
  {
    question: "What is an autonomous SEO agent?",
    answer:
      "An autonomous SEO agent is software that plans and executes SEO work — crawling a site, reading live SERPs, drafting fixes — without a human driving every step. SEO Forge splits that work across eight specialized agents, but keeps one step manual: nothing ships without your approval.",
  },
  {
    question: "How is SEO Forge different from tools that auto-publish content?",
    answer:
      "Many AI SEO tools publish directly to your CMS on a schedule. SEO Forge doesn't: every proposed title rewrite, internal-linking pass, or new article lands as a GitHub pull request first. You see the exact diff and decide — the agents never touch production directly.",
  },
  {
    question: "What do the agents actually look at before proposing a change?",
    answer:
      "Each review starts with a live crawl of your site — pages, metadata, internal links — and a fresh SERP check for every tracked keyword: current top 10, SERP features, and position history. Recommendations are grounded in that evidence, not generic best-practice templates.",
  },
  {
    question: "Who is SEO Forge built for?",
    answer:
      "Solopreneurs and small teams running one site, up to agencies managing a portfolio. The same eight-agent loop and human approval gate apply at every plan tier, from Solo to Scale.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

export default function LandingPage() {
  return (
    <main className="min-h-screen grid-fade">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />

      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-20 text-center">
        <p className="mb-6 rounded-full border border-edge bg-panel px-4 py-1.5 text-xs text-fg-mute">
          Autonomous SEO · Human-approved deploys
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
          Your website, optimized
          <br />
          <span className="text-primary glow-primary">while you sleep.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-mute">
          SEO Forge runs a team of AI agents that continuously reviews your site,
          watches the SERPs, rewrites what underperforms, generates on-brand media,
          and ships every change as a pull request you approve.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Show when="signed-out">
            <SignUpButton>
              <button className="inline-flex items-center gap-2 rounded-lg bg-amber px-6 py-3 font-semibold text-ink transition-colors duration-200 hover:bg-amber-400">
                Launch your agent team <ArrowRight size={18} aria-hidden />
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-amber px-6 py-3 font-semibold text-ink transition-colors duration-200 hover:bg-amber-400"
            >
              Go to mission control <ArrowRight size={18} aria-hidden />
            </Link>
          </Show>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-28 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="panel p-6 transition-colors duration-200">
            <f.icon className="mb-4 text-primary" size={22} aria-hidden />
            <h3 className="mb-2 text-sm font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-fg-mute">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-28">
        <h2 className="mb-6 text-2xl font-bold">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.question} className="panel p-6">
              <h3 className="text-sm font-semibold text-fg">{f.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-mute">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
=======
import type { Metadata } from "next";
import {
  EvidenceSection,
  FaqSection,
  FeatureGrid,
  FinalCta,
  IntegrationSection,
  MarketingShell,
  MeasurementSection,
  PageHero,
  PipelineSection,
  ProcessTimeline,
  TrustStrip,
} from "@/components/marketing/MarketingPage";
import type { MarketingPageSpec } from "@/lib/marketing-pages";

export const metadata: Metadata = {
  title: "SEOForge — Your autonomous content and search operations team",
  description: "SEOForge researches, creates and continuously optimizes website content through two coordinated agent pipelines, with evidence, validation and explicit human approval before production.",
  alternates: { canonical: "/" },
};

const home: MarketingPageSpec = {
  path: "",
  kind: "hub",
  eyebrow: "Autonomous research. Human authority.",
  title: "Your content and search teams never clock out.",
  description: "SEOForge continuously discovers what your audience needs, creates website-native articles and media, improves existing pages, measures search outcomes, and prepares validated production changes for your approval.",
  primaryCta: "Choose Your Plan",
  primaryHref: "/pricing",
  secondaryCta: "See How SEOForge Works",
  secondaryHref: "/how-it-works",
  features: [
    { title: "Build the next content opportunity", body: "Research demand, competitors and site gaps before turning a validated opportunity into a brief, article, media package and publishing proposal." },
    { title: "Improve what already exists", body: "Continuously monitor rankings, technical health, decay, cannibalization, links, competitors and citations to prioritize the next defensible improvement." },
    { title: "Fit the website you already own", body: "The Site Experience Engineer learns your repository or WordPress structure, components, typography and publishing conventions before preparing changes." },
    { title: "Operate under one Supervisor", body: "One orchestration layer controls schedules, budgets, conflicts, evidence standards, retries, approvals and post-deployment measurement." },
    { title: "Review the exact production change", body: "Inspect diffs, content, media, provenance, screenshots, checks, expected impact, risk and rollback before granting authenticated approval." },
    { title: "Measure outcomes without pretending", body: "Rankings, clicks and conversions are reported as observations; forecasts retain confidence ranges and agent hypotheses remain clearly labeled." },
  ],
  steps: ["Connect a GitHub repository or WordPress site", "Connect Search Console, GA4 and research providers", "Complete ownership, permission and readiness checks", "Capture a source-stamped baseline", "Run both autonomous pipelines on schedule", "Review an evidence-backed production proposal", "Approve the exact change in SEOForge", "Measure, retain, iterate or prepare a revert"],
  integrations: ["GitHub", "WordPress", "Search Console", "GA4", "DataForSEO", "Bing", "Slack", "Remote MCP"],
  faqs: [
    { question: "Does SEOForge publish without asking me?", answer: "No. Agents can investigate, draft, validate and stage changes, but production publication requires explicit authenticated approval and all configured repository or CMS controls." },
    { question: "Is this only a content optimizer?", answer: "No. Content Growth creates the next body of useful content while Search Optimization improves the existing site. Both operate continuously under one Supervisor." },
    { question: "Does SEOForge guarantee position one?", answer: "No platform controls a search engine. SEOForge makes rank improvement an objective, records evidence and measures results without guaranteeing a position." },
    { question: "Can it create and manage a new blog?", answer: "Yes. The managed-blog workflow can prepare a website-native blog experience, publishing structure, articles and media for GitHub-based sites or supported WordPress installations." },
    { question: "Is there a free trial?", answer: "No. SEOForge is a paid operational product because every workspace reserves provider, model, crawling, storage and agent capacity from the first run." },
  ],
  related: [{ href: "/platform", label: "Explore the platform" }, { href: "/agents", label: "Meet the four agents" }, { href: "/pricing", label: "Compare paid plans" }],
};

export default function HomePage() {
  return <MarketingShell><PageHero page={home} /><TrustStrip /><PipelineSection /><FeatureGrid features={home.features} /><ProcessTimeline steps={home.steps} /><EvidenceSection /><MeasurementSection /><IntegrationSection integrations={home.integrations} /><FaqSection faqs={home.faqs} /><FinalCta /></MarketingShell>;
>>>>>>> ad9802d (seo forge real upgrade)
}
