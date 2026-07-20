import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingPage";
import { posts } from "@/lib/posts";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const dynamicParams = false;
export function generateStaticParams() { return [...new Set(posts.map((post) => slugify(post.tag)))].map((category) => ({ category })); }
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> { const { category } = await params; const tag = posts.find((post) => slugify(post.tag) === category)?.tag; return tag ? { title: `${tag} articles`, description: `SEOForge field notes about ${tag}.` } : { title: "Blog category" }; }

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const matching = posts.filter((post) => slugify(post.tag) === category);
  if (!matching.length) notFound();
  return <MarketingShell><section className="marketing-hero border-b border-edge"><div className="mx-auto max-w-5xl px-6 py-20"><p className="marketing-kicker"><span />Blog category</p><h1 className="mt-6 text-4xl font-semibold sm:text-6xl">{matching[0].tag}</h1><p className="mt-5 text-lg text-fg-mute">Evidence-led notes from the SEOForge team.</p></div></section><section className="mx-auto grid max-w-5xl gap-4 px-6 py-20">{matching.map((post) => <Link key={post.slug} href={`/blog/${post.slug}`} className="marketing-card p-6"><p className="text-xs text-fg-faint">{post.date} · {post.readMinutes} min</p><h2 className="mt-3 text-xl font-semibold">{post.title}</h2><p className="mt-3 text-sm leading-6 text-fg-mute">{post.description}</p></Link>)}</section></MarketingShell>;
}
