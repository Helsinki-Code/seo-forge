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

export const metadata = {
  title: "How it works — SEO Forge",
  description:
    "How SEO Forge's autonomous agent team reviews your site, watches SERPs, optimizes content, and ships changes through human-approved pull requests.",
};

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

export default function HowItWorksPage() {
  return (
    <main className="grid-fade min-h-screen">
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
      <SiteFooter />
    </main>
  );
}
