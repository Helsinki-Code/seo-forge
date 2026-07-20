import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { FaqSection, FinalCta, MarketingShell } from "@/components/marketing/MarketingPage";

export const metadata: Metadata = { title: "Pricing — SEOForge", description: "Paid SEOForge plans for continuous content growth, search optimization and protected production delivery. No free trial.", alternates: { canonical: "/pricing" } };

const plans = [
  { key: "starter", name: "Starter", price: "$149", note: "For one focused website", highlight: false, includes: ["1 production site", "100 tracked search queries", "4-agent operating team", "Content and optimization pipelines", "Scheduled audits and rank checks", "GitHub or WordPress delivery", "Human approval workflow", "Monthly capacity allowance"] },
  { key: "growth", name: "Growth", price: "$399", note: "For a serious growth program", highlight: true, includes: ["3 production sites", "500 tracked search queries", "Higher content and media capacity", "Daily priority-market monitoring", "Competitor and backlink intelligence", "AI-citation observations", "Custom schedules and notifications", "API, webhooks and MCP access"] },
  { key: "agency", name: "Agency", price: "$999", note: "For client and portfolio operations", highlight: false, includes: ["10 production sites", "2,000 tracked search queries", "Workspace-isolated client operations", "Agency portfolio control room", "Higher concurrency and run capacity", "Opt-in same-workspace learning", "Priority support and onboarding", "Expanded developer-platform access"] },
] as const;

const comparisons = [
  ["Content Growth pipeline", true, true, true], ["Search Optimization pipeline", true, true, true], ["Workflow Supervisor", true, true, true], ["Site Experience Engineer", true, true, true], ["Explicit human production approval", true, true, true], ["Competitor and backlink intelligence", false, true, true], ["API, webhooks and remote MCP", false, true, true], ["Agency portfolio", false, false, true],
] as const;

const faqs = [
  { question: "Why is there no free trial?", answer: "SEOForge begins reserving crawling, model, provider, storage and agent capacity as soon as a workspace is activated. Paid onboarding also lets us verify production permissions and safety controls properly." },
  { question: "What is a tracked search query?", answer: "It is a keyword or phrase SEOForge monitors for a chosen market, search engine, location, language and device. The same phrase in two locations counts as two tracked queries." },
  { question: "Are model and provider costs unlimited?", answer: "No. Each plan includes defined operational capacity and enforced spend guardrails. The dashboard shows reserved and consumed usage before runs, and work stops safely when a cap is reached." },
  { question: "Do all plans include the four agents?", answer: "Yes. Plans change site count, tracked-query volume, run capacity, media allowance, concurrency and developer features—not the integrity of the operating model." },
  { question: "Can SEOForge guarantee a number-one ranking?", answer: "No. Search engines control rankings. SEOForge continuously investigates and improves the controllable inputs, then measures actual outcomes." },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="marketing-hero border-b border-edge/80"><div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-28"><p className="marketing-kicker justify-center"><span />Paid operations · no free trial</p><h1 className="mx-auto mt-6 max-w-5xl text-balance text-4xl font-semibold sm:text-6xl">Choose the capacity your organic-growth operation needs.</h1><p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-fg-mute">Every plan includes the same protected four-agent system. You pay for site capacity, tracked markets, research, content production, media, execution and measurement—not promises about search-engine outcomes.</p></div></section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-20 lg:grid-cols-3">
        {plans.map((plan) => <article key={plan.key} className={`marketing-card flex flex-col p-7 sm:p-8 ${plan.highlight ? "border-primary/60 shadow-[0_0_55px_-25px_rgba(59,130,246,.8)]" : ""}`}>{plan.highlight ? <span className="mb-5 w-fit rounded-full bg-primary/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.15em] text-primary">Recommended</span> : null}<h2 className="text-2xl font-semibold">{plan.name}</h2><p className="mt-2 text-sm text-fg-mute">{plan.note}</p><p className="display mt-7 text-5xl font-semibold">{plan.price}<span className="text-sm font-normal text-fg-faint">/month</span></p><ul className="mt-8 flex-1 space-y-3">{plan.includes.map((item) => <li key={item} className="flex gap-3 text-sm text-fg-mute"><Check size={15} className="mt-0.5 shrink-0 text-mint" />{item}</li>)}</ul><Link href={`/sign-up?plan=${plan.key}`} className={`marketing-button mt-8 w-full ${plan.highlight ? "marketing-button-primary" : "marketing-button-secondary"}`}>Choose {plan.name}</Link></article>)}
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20"><div className="overflow-x-auto rounded-2xl border border-edge"><table className="w-full min-w-[700px] border-collapse text-left text-sm"><caption className="border-b border-edge bg-panel px-6 py-5 text-left text-base font-semibold">Plan capability comparison</caption><thead><tr className="border-b border-edge bg-panel/70"><th className="px-6 py-4">Capability</th>{plans.map((p) => <th key={p.key} className="px-6 py-4">{p.name}</th>)}</tr></thead><tbody>{comparisons.map(([name, ...values]) => <tr key={name} className="border-b border-edge last:border-0"><td className="px-6 py-4 text-fg-mute">{name}</td>{values.map((value, index) => <td key={index} className="px-6 py-4">{value ? <Check size={16} className="text-mint" aria-label="Included" /> : <Minus size={16} className="text-fg-faint" aria-label="Not included" />}</td>)}</tr>)}</tbody></table></div><div className="mt-5 flex items-start gap-3 rounded-xl border border-amber/25 bg-amber/8 p-4 text-sm text-fg-mute"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-amber" /><p>Commercial quotas are enforced from entitlement data and an immutable usage ledger. The dashboard shows capacity before a run; exhausted workspaces fail closed instead of silently creating overages.</p></div></section>
      <FaqSection faqs={faqs} /><FinalCta title="Choose a paid plan and deploy your SEO operation." body="Connect a site only after subscribing. Readiness checks, scoped permissions and human production approval remain mandatory on every plan." />
    </MarketingShell>
  );
}
