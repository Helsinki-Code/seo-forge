import Link from "next/link";
import { SignUpButton, Show } from "@clerk/nextjs";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { ArrowRight, Bot, GitPullRequest, LineChart, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Autonomous agent team",
    body: "Eight specialized agents review your site, analyze live SERPs, and optimize content around the clock.",
  },
  {
    icon: LineChart,
    title: "Rankings, watched constantly",
    body: "Keyword positions and SERP features tracked over time, with every optimization tied to a measurable move.",
  },
  {
    icon: GitPullRequest,
    title: "Ship via pull request",
    body: "Every change lands as a GitHub PR. Nothing goes live without your approval — one click merges and deploys.",
  },
  {
    icon: ShieldCheck,
    title: "On-brand media, always",
    body: "Images and assets generated to match the tone and style of the articles they belong to.",
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
}
