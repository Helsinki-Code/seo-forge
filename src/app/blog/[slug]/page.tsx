import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getPost, posts } from "@/lib/posts";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: new Date(post.date).toISOString(),
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const relatedPosts = posts.filter((p) => p.slug !== post.slug);

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const wordCount = post.body.join(" ").trim().split(/\s+/).length;
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: [`${postUrl}/opengraph-image`],
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    url: postUrl,
    mainEntityOfPage: postUrl,
    articleSection: post.tag,
    wordCount,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
    },
  };

  return (
    <main className="grid-fade min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <Link href="/blog" className="text-xs text-primary hover:underline">
          ← All posts
        </Link>
        <div className="mt-4 flex items-center gap-3 text-[11px] text-fg-faint">
          <Link href={`/blog/category/${post.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full bg-primary/15 px-2.5 py-0.5 font-medium text-primary">{post.tag}</Link>
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
        {relatedPosts.length > 0 && (
          <div className="mt-12 border-t border-edge pt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fg-faint">
              Related reading
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="panel block p-5 transition-colors duration-200 hover:border-primary/50"
                >
                  <span className="text-[11px] font-medium text-primary">{p.tag}</span>
                  <h3 className="mt-1.5 text-sm font-semibold leading-snug text-fg">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-fg-mute">{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm font-medium">Want this running on your site?</p>
          <Link
            href="/pricing"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim"
          >
            Choose Your Plan
          </Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
