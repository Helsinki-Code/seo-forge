import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getPost, posts } from "@/lib/posts";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export function generateStaticParams() { return posts.map((p) => ({ slug: p.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return pageMetadata({ title: post.title, description: post.description, path: `/blog/${post.slug}`, type: "article", publishedTime: new Date(post.date).toISOString() });
}

const sectionHeadings: Record<string, string[]> = {
  "Agentic SEO": ["The loop was always there", "Specialists, not one giant prompt", "Where autonomy stops", "Why the approval gate matters", "What compounds over time"],
  Rankings: ["Why charts are not enough", "The investigation after movement", "A bounded job for agents", "From signal to reviewed change", "Two disciplines that keep it honest"],
  Media: ["The art-direction bottleneck", "Better inputs before better prompts", "Accessibility is part of the asset", "A reviewable media workflow", "Scale without sameness"],
};
const contextualCta: Record<string, [string,string,string]> = {
  "Agentic SEO": ["See the protected workflow", "Follow the complete evidence-to-approval operating loop.", "/how-it-works"],
  Rankings: ["Explore rank tracking", "See how observations, deployments and outcomes stay connected.", "/platform/search-optimization/rank-tracking"],
  Media: ["Explore the media studio", "See how article context becomes accessible, reviewable media.", "/platform/content-growth/media-studio"],
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const post = getPost(slug); if (!post) notFound();
  const relatedPosts = posts.filter((p) => p.slug !== post.slug);
  const postUrl = `${SITE_URL}/blog/${post.slug}`; const wordCount = post.body.join(" ").trim().split(/\s+/).length;
  const headings=sectionHeadings[post.tag] ?? post.body.map((_,index)=>`Section ${index+1}`);
  const cta=contextualCta[post.tag] ?? ["See how SEOForge works","Follow the operating loop.","/how-it-works"];
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description, image: [`${postUrl}/opengraph-image`], datePublished: new Date(post.date).toISOString(), dateModified: new Date(post.date).toISOString(), url: postUrl, mainEntityOfPage: postUrl, articleSection: post.tag, wordCount, author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL }, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` } } };

  return <main className="marketing-shell min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><SiteHeader />
    <header className="marketing-hero border-b border-edge"><div className="mx-auto max-w-6xl px-6 py-14 sm:py-20"><Link href="/blog" className="inline-flex items-center gap-2 text-xs text-fg-faint hover:text-primary"><ArrowLeft size={13}/>All field notes</Link><div className="mt-10 max-w-4xl"><div className="flex flex-wrap items-center gap-3 text-[11px] text-fg-faint"><Link href={`/blog/category/${post.tag.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`} className="rounded-full bg-primary/12 px-3 py-1 font-semibold text-primary">{post.tag}</Link><time dateTime={post.date}>{post.date}</time><span className="flex items-center gap-1"><Clock3 size={12}/>{post.readMinutes} min read</span></div><h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] sm:text-6xl">{post.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-fg-mute">{post.description}</p></div></div></header>
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_260px]">
      <article className="min-w-0"><div className="rounded-2xl border border-primary/20 bg-primary/8 p-6"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-primary"><BookOpen size={15}/>The short version</p><p className="mt-4 text-base leading-7 text-fg">{post.description}</p></div><div className="mt-12 space-y-12">{post.body.map((paragraph,index)=><section key={headings[index]} id={`section-${index+1}`} className="scroll-mt-28"><div className="mb-5 flex items-center gap-4"><span className="display text-xs text-primary">0{index+1}</span><span className="h-px flex-1 bg-edge"/></div><h2 className="text-2xl font-semibold sm:text-3xl">{headings[index]}</h2><p className="mt-5 text-base leading-8 text-fg-mute">{paragraph}</p></section>)}</div>
        <div className="mt-14 rounded-2xl border border-edge bg-panel p-7"><ShieldCheck size={20} className="text-mint"/><h2 className="mt-6 text-2xl font-semibold">{cta[0]}</h2><p className="mt-3 text-sm leading-6 text-fg-mute">{cta[1]}</p><Link href={cta[2]} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">Continue <ArrowRight size={14}/></Link></div>
      </article>
      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start"><div className="rounded-2xl border border-edge bg-panel p-5"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-fg-faint">In this field note</p><nav className="mt-5 space-y-3">{headings.map((heading,index)=><a key={heading} href={`#section-${index+1}`} className="flex gap-3 text-xs leading-5 text-fg-mute hover:text-primary"><span className="text-primary">0{index+1}</span>{heading}</a>)}</nav></div><div className="rounded-2xl border border-dashed border-edge-2 p-5 text-xs leading-5 text-fg-faint">Published by SEOForge. Product claims and ranking outcomes are kept separate; rank #1 is an objective, never a guarantee.</div></aside>
    </div>
    {relatedPosts.length ? <section className="border-t border-edge bg-panel/30"><div className="mx-auto max-w-6xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Continue reading</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{relatedPosts.map((item)=><Link key={item.slug} href={`/blog/${item.slug}`} className="marketing-card group p-6"><span className="text-[10px] text-primary">{item.tag}</span><h3 className="mt-4 text-lg font-semibold group-hover:text-primary">{item.title}</h3><p className="mt-3 text-sm leading-6 text-fg-mute">{item.description}</p></Link>)}</div></div></section> : null}<SiteFooter />
  </main>;
}
