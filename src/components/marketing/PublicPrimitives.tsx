import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleDollarSign, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

export function PublicShell({ children }: { children: ReactNode }) {
  return <main className="marketing-shell min-h-screen overflow-hidden"><SiteHeader />{children}<SiteFooter /></main>;
}

export function PublicHero({ eyebrow, title, description, primary, primaryHref, secondary, secondaryHref, visual }: { eyebrow: string; title: string; description: string; primary: string; primaryHref: string; secondary?: string; secondaryHref?: string; visual: ReactNode }) {
  return <section className="marketing-hero relative border-b border-edge/80"><div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-24"><div><p className="marketing-kicker"><span />{eyebrow}</p><h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.04] sm:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-fg-mute">{description}</p><div className="mt-8 flex flex-wrap gap-3"><Link href={primaryHref} className="marketing-button marketing-button-primary">{primary}<ArrowRight size={15} /></Link>{secondary && secondaryHref ? <Link href={secondaryHref} className="marketing-button marketing-button-secondary">{secondary}</Link> : null}</div><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-fg-faint"><span className="flex items-center gap-2"><ShieldCheck size={13} className="text-mint" />Nothing publishes without approval</span><span className="flex items-center gap-2"><CircleDollarSign size={13} className="text-amber" />Paid product access</span><span className="flex items-center gap-2"><TriangleAlert size={13} className="text-primary" />No ranking guarantees</span></div></div>{visual}</div></section>;
}

export function PublicSection({ children, muted = false, className = "" }: { children: ReactNode; muted?: boolean; className?: string }) {
  return <section className={`${muted ? "border-y border-edge/80 bg-panel/35" : ""} ${className}`}><div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">{children}</div></section>;
}

export function PublicHeading({ eyebrow, title, body, center = false }: { eyebrow: string; title: string; body?: string; center?: boolean }) {
  return <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">{eyebrow}</p><h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-5xl">{title}</h2>{body ? <p className="mt-5 text-pretty text-base leading-7 text-fg-mute sm:text-lg">{body}</p> : null}</div>;
}

export function PublicCard({ icon: Icon, title, body, children, tone = "primary" }: { icon?: LucideIcon; title: string; body?: string; children?: ReactNode; tone?: "primary" | "amber" | "mint" | "rose" }) {
  const tones = { primary: "bg-primary/10 text-primary", amber: "bg-amber/10 text-amber", mint: "bg-mint/10 text-mint", rose: "bg-rose/10 text-rose" };
  return <article className="marketing-card p-6 sm:p-7">{Icon ? <span className={`preview-icon ${tones[tone]}`}><Icon size={17} /></span> : null}<h3 className={`${Icon ? "mt-5" : ""} text-lg font-semibold`}>{title}</h3>{body ? <p className="mt-3 text-sm leading-6 text-fg-mute">{body}</p> : null}{children}</article>;
}

export function PublicSteps({ steps, accent = "primary" }: { steps: string[]; accent?: "primary" | "amber" | "mint" }) {
  const color = accent === "amber" ? "text-amber border-amber/25" : accent === "mint" ? "text-mint border-mint/25" : "text-primary border-primary/25";
  return <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step, index) => <li key={step} className="rounded-2xl border border-edge bg-panel p-5"><span className={`display flex h-8 w-8 items-center justify-center rounded-full border text-[10px] ${color}`}>{String(index + 1).padStart(2, "0")}</span><p className="mt-7 text-sm font-semibold">{step}</p><p className="mt-2 text-xs leading-5 text-fg-faint">Evidence, owner and next state remain visible.</p></li>)}</ol>;
}

export function PublicChecklist({ items, negative = false }: { items: string[]; negative?: boolean }) {
  return <ul className="mt-5 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-fg-mute">{negative ? <TriangleAlert size={15} className="mt-1 shrink-0 text-rose" /> : <Check size={15} className="mt-1 shrink-0 text-mint" />}{item}</li>)}</ul>;
}

export function PublicFaq({ items }: { items: Array<[string, string]> }) {
  return <PublicSection><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><PublicHeading eyebrow="Questions" title="Know the boundary before connecting production." /><div className="divide-y divide-edge rounded-2xl border border-edge bg-panel px-6">{items.map(([question, answer], index) => <details key={question} open={index === 0} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold"><span>{question}</span><span className="text-primary group-open:rotate-45">+</span></summary><p className="pt-4 text-sm leading-6 text-fg-mute">{answer}</p></details>)}</div></div></PublicSection>;
}

export function PublicCta({ title, body, primary = "Choose Your Plan", href = "/pricing", secondary = "Book a Demo", secondaryHref = "/demo", restrained = false }: { title: string; body: string; primary?: string; href?: string; secondary?: string; secondaryHref?: string; restrained?: boolean }) {
  return <PublicSection className="!pt-0"><div className={`relative overflow-hidden rounded-3xl border p-8 sm:p-12 ${restrained ? "border-edge bg-panel" : "border-primary/25 bg-gradient-to-br from-primary/15 via-panel to-amber/8"}`}><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Paid deployment · human authority</p><h2 className="mt-5 max-w-4xl text-balance text-3xl font-semibold sm:text-5xl">{title}</h2><p className="mt-5 max-w-2xl text-base leading-7 text-fg-mute">{body}</p><div className="mt-8 flex flex-wrap gap-3"><Link href={href} className="marketing-button marketing-button-primary">{primary}<ArrowRight size={15}/></Link><Link href={secondaryHref} className="marketing-button marketing-button-secondary">{secondary}</Link></div></div></PublicSection>;
}

export function PublicProofNotice() {
  return <div className="rounded-2xl border border-dashed border-edge-2 bg-panel/40 p-6"><p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={17} className="text-mint" />Verified proof only</p><p className="mt-2 text-sm leading-6 text-fg-mute">Customer results appear only with a confirmed baseline, observation period, screenshots and attribution. SEOForge does not publish invented logos, counters, testimonials or rankings.</p></div>;
}
