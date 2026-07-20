import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingPage";
import { posts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description: "Field notes on agentic SEO, SERP monitoring, and human-in-the-loop publishing.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <MarketingShell>
      <section className="marketing-hero border-b border-edge"><div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="marketing-kicker"><span />Field notes</p>
        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold sm:text-6xl">Search operations, explained with the boundary conditions visible.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-fg-mute">Practical thinking about autonomous content, continuous optimization, evidence, production safety and measurement.</p>
      </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-6 py-20 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
          className="marketing-card group p-6 transition-colors duration-200"
          >
            <div className="mb-2 flex items-center gap-3 text-[11px] text-fg-faint">
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-medium text-primary">
                {p.tag}
              </span>
              <time dateTime={p.date}>{p.date}</time>
              <span>{p.readMinutes} min read</span>
            </div>
            <h2 className="text-lg font-semibold transition-colors duration-200 group-hover:text-primary">
              {p.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-mute">{p.description}</p>
          </Link>
        ))}
      </section>
    </MarketingShell>
  );
}
