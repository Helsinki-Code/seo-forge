import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
<<<<<<< HEAD
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Talk to the team behind the autonomous SEO agents.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="grid-fade min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <h1 className="text-4xl font-bold">Talk to a human</h1>
        <p className="mt-3 text-lg text-fg-mute">
          The agents handle the SERPs; we handle everything else. Questions about plans,
          custom workflows, or agencies — send a note.
        </p>
        <div className="mt-10">
          <ContactForm />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
=======
import { MarketingShell } from "@/components/marketing/MarketingPage";

export const metadata: Metadata = { title: "Contact", description: "Contact SEOForge about plans, onboarding, security, agencies or custom workflows." };
export default function ContactPage() { return <MarketingShell><section className="marketing-hero border-b border-edge"><div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[.8fr_1.2fr]"><div><p className="marketing-kicker"><span />Talk to SEOForge</p><h1 className="mt-6 text-balance text-4xl font-semibold sm:text-6xl">Bring the website. We’ll map the operating model.</h1><p className="mt-6 text-lg leading-8 text-fg-mute">Tell us about your sites, publishing system, markets, content goals and approval requirements. There is no free trial; we will help you choose the right paid capacity before connecting production.</p><div className="mt-8 space-y-3 text-sm text-fg-mute"><p>Plan and capacity questions</p><p>Agency and multi-site onboarding</p><p>Security and provider access review</p><p>GitHub, WordPress, API and MCP workflows</p></div></div><div className="marketing-card p-6 sm:p-8"><ContactForm /></div></div></section></MarketingShell>; }
>>>>>>> ad9802d (seo forge real upgrade)
