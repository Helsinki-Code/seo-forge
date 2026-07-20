import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, PenLine, Radar, ShieldCheck } from "lucide-react";
import { PublicCta, PublicHeading, PublicSection, PublicShell } from "@/components/marketing/PublicPrimitives";
import { posts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "SEOForge Field Notes", description: "Evidence-led field notes about autonomous content operations, search optimization, media and protected production delivery.", path: "/blog" });

const categoryMeta: Record<string, { icon: typeof Radar; description: string }> = {
  "Agentic SEO": { icon: ShieldCheck, description: "Where autonomous investigation ends and human production authority begins." },
  Rankings: { icon: Radar, description: "Turning search movement into evidence, decisions and measured action." },
  Media: { icon: PenLine, description: "Building article visuals from brand context instead of generic templates." },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = posts;
  return <PublicShell>
    <section className="marketing-hero border-b border-edge/80"><div className="mx-auto max-w-7xl px-6 py-16 sm:py-24"><div className="grid items-end gap-10 lg:grid-cols-[1fr_.65fr]"><div><p className="marketing-kicker"><span />SEOForge field notes</p><h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">The operating manual for continuous, human-controlled search growth.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-fg-mute">No recycled trend posts. We document the workflows, boundaries and measurement problems behind autonomous content and optimization.</p></div><div className="rounded-2xl border border-dashed border-edge-2 bg-panel/40 p-5 text-sm leading-6 text-fg-mute"><ShieldCheck size={18} className="mb-4 text-mint" /><strong className="text-fg">Editorial standard:</strong> observations are distinguished from opinions, external claims require sources, and product outcomes are never presented as guaranteed rankings.</div></div></div></section>

    <PublicSection>
      <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-3xl border border-edge bg-panel transition hover:border-primary/35 lg:grid-cols-[1.12fr_.88fr]">
        <div className="p-7 sm:p-10"><div className="flex flex-wrap items-center gap-3 text-[11px] text-fg-faint"><span className="rounded-full bg-primary/12 px-3 py-1 font-semibold text-primary">Featured · {featured.tag}</span><time dateTime={featured.date}>{featured.date}</time><span className="flex items-center gap-1"><Clock3 size={12}/>{featured.readMinutes} min</span></div><h2 className="mt-8 max-w-3xl text-balance text-3xl font-semibold leading-tight sm:text-5xl">{featured.title}</h2><p className="mt-5 max-w-2xl text-base leading-7 text-fg-mute">{featured.description}</p><span className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read the field note <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span></div>
        <div className="relative min-h-72 overflow-hidden border-t border-edge bg-gradient-to-br from-primary/20 via-panel-2 to-amber/10 p-8 lg:border-l lg:border-t-0"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--color-edge)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-edge)_1px,transparent_1px)] [background-size:36px_36px]"/><div className="relative mx-auto flex h-full max-w-sm flex-col justify-between rounded-2xl border border-edge bg-ink/80 p-6"><p className="text-[10px] uppercase tracking-[.2em] text-primary">Research memo 001</p><BookOpen size={56} strokeWidth={1} className="text-primary"/><p className="text-sm font-semibold">Autonomy with an explicit production boundary</p></div></div>
      </Link>
    </PublicSection>

    <PublicSection muted><PublicHeading eyebrow="Explore by discipline" title="Three problems. Three editorial tracks." /><div className="mt-10 grid gap-4 md:grid-cols-3">{Object.entries(categoryMeta).map(([category, meta]) => { const Icon=meta.icon; const slug=category.toLowerCase().replace(/[^a-z0-9]+/g,"-"); return <Link key={category} href={`/blog/category/${slug}`} className="marketing-card group p-6"><Icon size={20} className="text-primary"/><h2 className="mt-8 text-xl font-semibold">{category}</h2><p className="mt-3 text-sm leading-6 text-fg-mute">{meta.description}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-primary">Open category <ArrowRight size={13}/></span></Link>; })}</div></PublicSection>

    {rest.length ? <PublicSection><div className="flex items-end justify-between gap-6"><PublicHeading eyebrow="Latest" title="New research from the operating loop." /><span className="hidden text-xs text-fg-faint sm:block">Updated when the evidence changes</span></div><div className="mt-12 grid gap-5 sm:grid-cols-2">{rest.map((post,index)=><Link key={post.slug} href={`/blog/${post.slug}`} className="marketing-card group p-7"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-primary">{post.tag}</span><span className="text-[10px] text-fg-faint">0{index+2}</span></div><h2 className="mt-10 text-2xl font-semibold leading-snug group-hover:text-primary">{post.title}</h2><p className="mt-4 text-sm leading-6 text-fg-mute">{post.description}</p><div className="mt-8 flex items-center gap-3 border-t border-edge pt-5 text-[11px] text-fg-faint"><time dateTime={post.date}>{post.date}</time><span>·</span><span>{post.readMinutes} min read</span></div></Link>)}</div></PublicSection> : null}
    <PublicCta title="Turn the operating model into a working search team." body="SEOForge is a paid platform. Choose the capacity that matches your sites, tracked queries and publishing cadence." secondary="See How It Works" secondaryHref="/how-it-works" />
  </PublicShell>;
}
