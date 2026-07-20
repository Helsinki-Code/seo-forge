import type { Metadata } from "next";
import { ArrowRight, Building2, Check, GitBranch, ShieldCheck } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { PublicHeading, PublicSection, PublicShell } from "@/components/marketing/PublicPrimitives";

export const metadata: Metadata = { title: "Contact SEOForge", description: "Discuss SEOForge plans, agency portfolios, production workflows, security and onboarding for your website." };

export default function ContactPage() {
  return <PublicShell>
    <section className="marketing-hero border-b border-edge/80"><div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[.82fr_1.18fr] lg:py-24">
      <div><p className="marketing-kicker"><span />Talk to the team</p><h1 className="mt-6 text-balance text-4xl font-semibold leading-tight sm:text-6xl">Let’s map the search operation your website actually needs.</h1><p className="mt-6 text-lg leading-8 text-fg-mute">Bring the site, publishing system, markets and approval requirements. We’ll determine the right paid capacity and whether GitHub, WordPress or a mixed workflow fits.</p>
        <div className="mt-10 space-y-4">{[[Building2,"Agency and multi-site planning"],[GitBranch,"Repository or WordPress delivery design"],[ShieldCheck,"Security and human-approval review"]].map(([Icon, text]) => <div key={String(text)} className="flex items-center gap-3 text-sm"><span className="preview-icon bg-primary/10 text-primary"><Icon size={16}/></span>{String(text)}</div>)}</div>
      </div>
      <div className="marketing-card p-6 sm:p-8"><div className="mb-7 flex items-center justify-between border-b border-edge pb-5"><div><p className="text-sm font-semibold">Tell us about the operation</p><p className="mt-1 text-xs text-fg-faint">Six fields · no credentials requested</p></div><ArrowRight size={18} className="text-primary" /></div><ContactForm /></div>
    </div></section>
    <PublicSection muted><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><PublicHeading eyebrow="What happens next" title="A useful response, not a generic sales sequence." body="We use the information only to understand fit and prepare the next conversation. Connecting a site happens later through explicit authorization inside the product." /><ol className="space-y-4">{["We review your site type, portfolio size and stated goal.","We identify the likely plan and any technical onboarding questions.","We reply with a focused next step: plan selection, demo or security discussion.","If you proceed, production access is authorized separately and remains revocable."].map((step,index)=><li key={step} className="flex gap-4 rounded-2xl border border-edge bg-panel p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 text-[10px] text-primary">0{index+1}</span><p className="pt-1 text-sm leading-6 text-fg-mute">{step}</p></li>)}</ol></div></PublicSection>
    <PublicSection><div className="grid gap-6 lg:grid-cols-3"><div className="lg:col-span-1"><PublicHeading eyebrow="Before you send" title="Know what we will never ask for here." /></div><div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">{["No GitHub private keys","No WordPress passwords","No analytics credentials","No payment details"].map(item=><div key={item} className="flex items-center gap-3 rounded-xl border border-edge bg-panel p-5 text-sm"><Check size={16} className="text-mint"/>{item}</div>)}</div></div></PublicSection>
  </PublicShell>;
}
