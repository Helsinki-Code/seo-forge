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
}
