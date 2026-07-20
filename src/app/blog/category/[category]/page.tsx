import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookMarked } from "lucide-react";
import { PublicCta, PublicSection, PublicShell } from "@/components/marketing/PublicPrimitives";
import { posts } from "@/lib/posts";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const descriptions: Record<string,string> = { "Agentic SEO": "Architecture, boundaries and operating practices for agent-led search work that keeps people in control.", Rankings: "How monitoring becomes useful action—and how deployments remain connected to measured outcomes.", Media: "Practical systems for brand-aware article imagery, accessibility metadata and reviewable asset production." };

export const dynamicParams = false;
export function generateStaticParams() { return [...new Set(posts.map((post) => slugify(post.tag)))].map((category) => ({ category })); }
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> { const { category } = await params; const tag = posts.find((post) => slugify(post.tag) === category)?.tag; return tag ? { title: `${tag} Field Notes`, description: descriptions[tag] ?? `SEOForge field notes about ${tag}.` } : { title: "Blog category" }; }

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const matching = posts.filter((post) => slugify(post.tag) === category);
  if (!matching.length) notFound();
  const tag=matching[0].tag;
  return <PublicShell>
    <section className="marketing-hero border-b border-edge"><div className="mx-auto max-w-7xl px-6 py-16 sm:py-24"><Link href="/blog" className="inline-flex items-center gap-2 text-xs text-fg-faint hover:text-primary"><ArrowLeft size={13}/>All field notes</Link><div className="mt-12 grid items-end gap-8 lg:grid-cols-[1fr_.5fr]"><div><p className="marketing-kicker"><span />Editorial track</p><h1 className="mt-6 text-5xl font-semibold sm:text-7xl">{tag}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-fg-mute">{descriptions[tag]}</p></div><div className="rounded-2xl border border-edge bg-panel p-6"><BookMarked size={22} className="text-primary"/><p className="mt-8 text-3xl font-semibold">{matching.length}</p><p className="mt-1 text-xs uppercase tracking-[.15em] text-fg-faint">published field {matching.length === 1 ? "note" : "notes"}</p></div></div></div></section>
    <PublicSection><div className="space-y-4">{matching.map((post,index)=><Link key={post.slug} href={`/blog/${post.slug}`} className="group grid gap-6 rounded-2xl border border-edge bg-panel p-6 transition hover:border-primary/35 sm:grid-cols-[80px_1fr_auto] sm:items-center"><span className="display text-3xl text-fg-faint">{String(index+1).padStart(2,"0")}</span><div><p className="text-[10px] uppercase tracking-[.15em] text-primary">{post.date} · {post.readMinutes} min</p><h2 className="mt-3 text-xl font-semibold group-hover:text-primary">{post.title}</h2><p className="mt-2 text-sm leading-6 text-fg-mute">{post.description}</p></div><ArrowRight size={18} className="text-fg-faint transition group-hover:translate-x-1 group-hover:text-primary"/></Link>)}</div></PublicSection>
    <PublicCta title={`Put ${tag.toLowerCase()} into a continuous operating loop.`} body="Choose a paid plan to connect the evidence sources, production destination and human approval policy for your website." secondary="Browse All Notes" secondaryHref="/blog" restrained />
  </PublicShell>;
}
