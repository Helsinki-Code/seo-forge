<<<<<<< HEAD
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Why SEO Forge exists: search optimization is a continuous process, so we made it a continuous system.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="grid-fade min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold">
          SEO is a process.
          <br />
          <span className="text-primary glow-primary">We made it a system.</span>
        </h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-fg-mute">
          <p>
            Search optimization never finishes. SERPs shift daily, competitors publish
            hourly, and yesterday&apos;s winning title is today&apos;s position seven. Doing
            this well has always meant constant, repetitive, evidence-driven work — the kind
            humans burn out on and agents thrive on.
          </p>
          <p>
            SEO Forge runs a team of eight specialized AI agents on the Anthropic platform.
            They review the site, watch the rankings, study live SERPs, rewrite what
            underperforms, keep internal links coherent, and generate media that matches
            each article&apos;s tone. They work in a loop, around the clock.
          </p>
          <p>
            But we drew one hard line: <strong className="text-fg">agents never deploy</strong>.
            Every change they propose becomes a GitHub pull request, and a human — you —
            decides what goes live. Autonomy for the work, authority for the human.
          </p>
          <p>
            The result is a compounding system: every review makes the next optimization
            sharper, every approval teaches the team your standards, and every ranking
            movement feeds the next hypothesis.
          </p>
        </div>
        <div className="panel mt-10 grid grid-cols-1 gap-6 p-8 sm:grid-cols-3">
          <div>
            <p className="display text-3xl font-semibold text-primary">8</p>
            <p className="mt-1 text-xs text-fg-mute">specialized agents on the team</p>
          </div>
          <div>
            <p className="display text-3xl font-semibold text-amber">24/7</p>
            <p className="mt-1 text-xs text-fg-mute">continuous review &amp; SERP watch</p>
          </div>
          <div>
            <p className="display text-3xl font-semibold text-mint">100%</p>
            <p className="mt-1 text-xs text-fg-mute">of deploys approved by a human</p>
          </div>
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

export const metadata: Metadata = { title: "About", description: "Why SEOForge treats content creation, search optimization and production delivery as one accountable operating system." };
const page: MarketingPageSpec = { path: "about", kind: "hub", eyebrow: "Why SEOForge exists", title: "Search growth is continuous work. We built a continuous system.", description: "Teams should not have to choose between scaling useful content and protecting what they already rank for. SEOForge gives both jobs permanent ownership while people keep editorial and production authority.", primaryCta: "Choose Your Plan", primaryHref: "/pricing", secondaryCta: "Meet the Agents", secondaryHref: "/agents", features: [{ title: "One accountable system", body: "Research, creation, optimization, implementation and measurement share context and ownership instead of disappearing between tools." }, { title: "Automation with boundaries", body: "Agents work continuously, but production publication remains an explicit authenticated human decision." }, { title: "Evidence over theater", body: "Sources, capture times, tool results and concise decision summaries matter more than opaque AI performance claims." }, { title: "Website-native delivery", body: "Work is prepared for the actual repository or WordPress installation, not exported as a disconnected document." }, { title: "Capacity you can control", body: "Plans enforce operational budgets, quotas and concurrency before work begins." }, { title: "Outcomes measured honestly", body: "SEOForge distinguishes observations, forecasts and hypotheses and never guarantees search-engine rankings." }], steps: ["Connect an authorized website", "Capture a source-stamped baseline", "Run both pipelines continuously", "Prepare the best supported change", "Require explicit human approval", "Measure the production outcome"], integrations: ["GitHub", "WordPress", "Search Console", "GA4", "DataForSEO", "Slack"], faqs: [{ question: "How many agents operate the system?", answer: "Four: Workflow Supervisor, Content Growth Agent, Search Optimization Agent and Site Experience Engineer." }, { question: "Who owns the final decision?", answer: "The authenticated human reviewing the exact production proposal. Agents never inherit that authority." }], related: [{ href: "/agents", label: "Meet the agents" }, { href: "/how-it-works", label: "See the workflow" }, { href: "/pricing", label: "Compare plans" }] };
export default function AboutPage() { return <MarketingPage page={page} />; }
>>>>>>> ad9802d (seo forge real upgrade)
