import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata = {
  title: "About — SEO Forge",
  description:
    "Why SEO Forge exists: search optimization is a continuous process, so we made it a continuous system.",
};

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
