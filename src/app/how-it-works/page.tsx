<<<<<<< HEAD
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import {
  Bot,
  GitPullRequest,
  Globe,
  Image as ImageIcon,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "How SEO Forge's autonomous agent team reviews your site, watches SERPs, optimizes content, and ships changes through human-approved pull requests.",
  path: "/how-it-works",
});

const steps = [
  {
    icon: Globe,
    title: "1 · Continuous site review",
    body: "On a nightly schedule (and on demand), the Strategy Agent crawls your site — pages, metadata, internal links, content quality — and builds a live picture of what's working.",
  },
  {
    icon: Search,
    title: "2 · Dynamic SERP & ranking watch",
    body: "For every tracked keyword, agents run fresh SERP analysis: who ranks, which SERP features appear, where you moved. Every position change is recorded and charted.",
  },
  {
    icon: Sparkles,
    title: "3 · Optimization, proposed",
    body: "The team drafts the highest-impact fixes — CTR-optimized titles and metas, internal linking passes, full content refreshes — grounded in real SERP evidence, never fabricated claims.",
  },
  {
    icon: ImageIcon,
    title: "4 · Media that matches",
    body: "The Image Generator reads each article first, learns its tone and visual style, then produces hero and in-content images with SEO alt text that belong to the piece.",
  },
  {
    icon: GitPullRequest,
    title: "5 · Ship as a pull request",
    body: "Every change lands as a GitHub PR on your website repository. Nothing touches production autonomously — the agents propose, you dispose.",
  },
  {
    icon: ShieldCheck,
    title: "6 · You approve, it deploys",
    body: "One click in the Approvals queue merges the PR; your pipeline takes it live. Rejected changes teach the team what you don't want.",
  },
  {
    icon: LineChart,
    title: "7 · Measure, then loop",
    body: "Post-deploy, rankings keep being watched. What moved up gets reinforced; what didn't gets a new hypothesis. The loop never stops.",
  },
  {
    icon: Bot,
    title: "The team behind it",
    body: "Eight specialized Anthropic agents — orchestration, research, strategy, architecture, writing, media, and monetization — each versioned, auditable, and watchable live.",
  },
];

const faqs = [
  {
    question: "Does the AI agent deploy changes to my website automatically?",
    answer:
      "No. Agents never push to production. Every proposed change — a title rewrite, an internal-linking pass, a new article — lands as a pull request on your website's GitHub repository. A human reviews the diff and decides whether to merge it.",
  },
  {
    question: "How often does SEO Forge review my site and rankings?",
    answer:
      "A nightly cron job runs an autonomous review across your tracked keywords and site content, and you can trigger an on-demand review at any time. Each tracked keyword gets a fresh SERP analysis, not a cached snapshot.",
  },
  {
    question: "Can I reject a change an agent proposes?",
    answer:
      "Yes. The Approvals queue lists every open pull request with one-click Approve & merge or Reject. Rejected changes aren't discarded silently — they're recorded so the agent team learns what you don't want repeated.",
  },
  {
    question: "What does the eight-agent team actually cover?",
    answer:
      "Content Production Orchestrator, Primary Blogger, Product Marketing Context Builder, Site Architecture, SEO Content Strategy, SEO Content Writer, Article Image Generator, and Affiliate Product Research — each a separate, versioned agent rather than one general-purpose model doing everything.",
  },
  {
    question: "Does SEO Forge guarantee higher rankings?",
    answer:
      "No. Search rankings are set by third-party search engines, not by SEO Forge. The agent team optimizes persistently toward better positions — sharper titles, cleaner technical SEO, more relevant content — but no tool can guarantee a specific ranking outcome.",
  },
  {
    question: "What happens after a change goes live?",
    answer:
      "Rankings keep being watched post-deploy. Movements are annotated against the specific change that shipped, so you can see whether a merged PR actually moved the keyword it targeted, and the next review builds on that evidence.",
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

export default function HowItWorksPage() {
  return (
    <main className="grid-fade min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          The loop that ranks you{" "}
          <span className="text-primary glow-primary">while you sleep</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-fg-mute">
          SEO Forge is a closed feedback loop: review → analyze → optimize → approve →
          deploy → measure. Autonomous where it should be, human where it must be.
        </p>
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.title} className="panel p-6 transition-colors duration-200">
            <s.icon size={20} className="mb-3 text-primary" aria-hidden />
            <h2 className="mb-2 text-sm font-semibold">{s.title}</h2>
            <p className="text-sm leading-relaxed text-fg-mute">{s.body}</p>
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
}
=======
import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/MarketingPage";
import type { MarketingPageSpec } from "@/lib/marketing-pages";

export const metadata: Metadata = { title: "How it works", description: "From provider evidence to content or optimization proposal, explicit approval, production delivery and outcome measurement." };
const page: MarketingPageSpec = { path: "how-it-works", kind: "hub", eyebrow: "The complete workflow", title: "From search evidence to an approved production outcome.", description: "SEOForge keeps creation and optimization moving independently, coordinates them through one Supervisor, and stops every production change at a review surface built for a human decision.", primaryCta: "Choose Your Plan", primaryHref: "/pricing", secondaryCta: "Book a Demo", secondaryHref: "/demo", features: [{ title: "Continuous provider ingestion", body: "Normalize website, search, analytics, ranking, competitor, backlink and production observations with source and freshness context." }, { title: "Two independent work queues", body: "New-content work does not block optimization, and optimization does not consume the entire editorial calendar." }, { title: "Supervisor prioritization", body: "Budgets, urgency, evidence strength, impact, conflict and readiness determine what moves forward." }, { title: "Specialist investigation", body: "The responsible agent gathers the evidence and records a concise, reviewable decision summary." }, { title: "Website-native proposal", body: "The Site Experience Engineer prepares the exact GitHub or WordPress change with tests and rollback context." }, { title: "Human decision and measurement", body: "Only explicit approval reaches production; later observations determine retain, iterate or revert." }], steps: ["Ingest and normalize authorized provider data", "Detect an anomaly or qualified opportunity", "Prioritize through the Workflow Supervisor", "Investigate with the responsible specialist", "Create an evidence-backed finding and hypothesis", "Prepare and validate the website-native change", "Present diff, preview, risk, provenance and rollback", "Require explicit authenticated human approval", "Publish through the configured GitHub or WordPress control", "Validate production and measure the observation window"], integrations: ["GitHub", "WordPress", "Search Console", "GA4", "DataForSEO", "Bing", "Slack", "Remote MCP"], faqs: [{ question: "Can a cron job deploy directly?", answer: "No. Schedules and heartbeats can investigate and prepare production work, but they cannot approve or publish it." }, { question: "What happens when a check fails?", answer: "The proposal remains blocked, the failure and retry state stay visible, and recovery must satisfy the configured validation policy." }, { question: "What happens after deployment?", answer: "SEOForge runs smoke, crawl, schema, link and performance checks, then measures search and conversion observations over the chosen window." }], related: [{ href: "/platform", label: "Explore the platform" }, { href: "/platform/human-approval", label: "Review human approval" }, { href: "/pricing", label: "Choose a plan" }] };
export default function HowItWorksPage() { return <MarketingPage page={page} />; }
>>>>>>> ad9802d (seo forge real upgrade)
