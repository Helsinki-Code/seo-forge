import type { Metadata } from "next";
import { ArrowDown, Blocks, GitPullRequest, Radar, Scale, ShieldCheck, Workflow } from "lucide-react";
import {
  PublicCard,
  PublicCta,
  PublicHeading,
  PublicHero,
  PublicProofNotice,
  PublicSection,
  PublicShell,
} from "@/components/marketing/PublicPrimitives";

export const metadata: Metadata = {
  title: "About SEOForge",
  description: "Why SEOForge built one accountable operating system for continuous content growth, search optimization and human-approved website delivery.",
};

const principles = [
  [ShieldCheck, "Human authority is a product feature", "Research can run continuously. Production cannot. Every exact change waits in a review stack until an authenticated person approves it."],
  [Radar, "Evidence before confidence", "A recommendation carries its source, capture time, affected URL, uncertainty and expected measurement window—not just an AI-generated opinion."],
  [Scale, "Rankings are measured, never promised", "Search engines remain independent systems. We optimize toward durable visibility while separating observed outcomes, forecasts and hypotheses."],
  [Blocks, "The website is the system of record", "Content does not end as a document in another tool. Approved work is prepared for the connected repository or WordPress installation."],
] as const;

export default function AboutPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Why SEOForge exists"
        title="Search growth should not depend on somebody remembering to do the work."
        description="Most teams split research, writing, technical SEO, publishing and measurement across disconnected tools. SEOForge gives the complete operating loop permanent ownership—without taking editorial or production authority away from people."
        primary="See How It Works"
        primaryHref="/how-it-works"
        secondary="Meet the Four Agents"
        secondaryHref="/agents"
        visual={
          <div className="relative rounded-3xl border border-edge bg-panel p-6 shadow-2xl shadow-black/10 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-fg-faint">The old handoff</p>
            <div className="mt-5 space-y-3">
              {["Strategy deck", "Writing queue", "SEO spreadsheet", "Developer ticket", "Analytics report"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-xl border border-edge bg-panel-2 px-4 py-3 text-sm">
                  <span>{item}</span><span className="text-[10px] text-rose">owner changes</span>
                  {index < 4 ? <ArrowDown className="absolute hidden" /> : null}
                </div>
              ))}
            </div>
            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[.15em] text-amber"><span className="h-px flex-1 bg-amber/25" />Replace handoffs with state<span className="h-px flex-1 bg-amber/25" /></div>
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5">
              <p className="text-sm font-semibold">One evidence → approval → measurement loop</p>
              <p className="mt-2 text-xs leading-5 text-fg-mute">Every task keeps its context, owner, production boundary and outcome.</p>
            </div>
          </div>
        }
      />

      <PublicSection>
        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <PublicHeading eyebrow="The thesis" title="Content creation and content optimization are different jobs. Both must stay active." body="A publishing engine alone creates decay and overlap. An optimization tool alone eventually runs out of new demand to capture. SEOForge runs both divisions under one supervisor, sharing evidence without competing for the same pages." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PublicCard icon={Workflow} title="Content Growth Division" body="Researches demand, selects defensible topics, prepares briefs, writes source-backed articles and proposes native media." tone="mint" />
            <PublicCard icon={Radar} title="Search Optimization Division" body="Monitors existing pages, rankings, indexation, decay, cannibalization, competitors, links and technical health." tone="amber" />
            <PublicCard icon={Blocks} title="Site Experience Engineering" body="Learns the website's code, design system and CMS so approved output belongs in the actual product experience." />
            <PublicCard icon={GitPullRequest} title="Workflow Supervision" body="Allocates budgets, resolves collisions, checks readiness and moves only validated work into the human review stack." tone="rose" />
          </div>
        </div>
      </PublicSection>

      <PublicSection muted>
        <PublicHeading eyebrow="Operating principles" title="The boundaries are part of the architecture." body="Autonomy becomes useful only when evidence, spending, credentials and production access have enforceable limits." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {principles.map(([icon, title, body]) => <PublicCard key={title} icon={icon} title={title} body={body} />)}
        </div>
      </PublicSection>

      <PublicSection>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_.85fr]">
          <div>
            <PublicHeading eyebrow="Proof policy" title="We would rather show an empty proof slot than manufacture certainty." body="SEO marketing is full of screenshots without baselines, timelines without annotations and numbers without attribution. SEOForge treats provenance as a product requirement for customer stories and for every proposal generated inside the platform." />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Captured baseline", "Dated deployment", "Measured observation window"].map((item, index) => <div key={item} className="rounded-xl border border-edge bg-panel p-4"><span className="text-[10px] text-primary">0{index + 1}</span><p className="mt-6 text-sm font-semibold">{item}</p></div>)}
            </div>
          </div>
          <PublicProofNotice />
        </div>
      </PublicSection>

      <PublicCta title="Put a permanent search operation behind your website." body="Choose paid capacity for one site or an agency portfolio. The team starts only after connections, ownership and production safeguards are ready." />
    </PublicShell>
  );
}
