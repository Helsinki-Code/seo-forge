import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getPost, posts } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found — SEO Forge" };
  return { title: `${post.title} — SEO Forge`, description: post.description };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className="grid-fade min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <Link href="/blog" className="text-xs text-primary hover:underline">
          ← All posts
        </Link>
        <div className="mt-4 flex items-center gap-3 text-[11px] text-fg-faint">
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-medium text-primary">
            {post.tag}
          </span>
          <time dateTime={post.date}>{post.date}</time>
          <span>{post.readMinutes} min read</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-fg-mute">{post.description}</p>
        <div className="mt-10 space-y-5">
          {post.body.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-fg-mute">
              {para}
            </p>
          ))}
        </div>
        <div className="panel mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm font-medium">Want this running on your site?</p>
          <Link
            href="/how-it-works"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim"
          >
            See how it works
          </Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
