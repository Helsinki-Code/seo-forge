import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { posts } from "@/lib/posts";

export const metadata = {
  title: "Blog — SEO Forge",
  description: "Field notes on agentic SEO, SERP monitoring, and human-in-the-loop publishing.",
};

export default function BlogIndexPage() {
  return (
    <main className="grid-fade min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-6 pt-16">
        <h1 className="text-4xl font-bold">Field notes</h1>
        <p className="mt-3 text-lg text-fg-mute">
          What we&apos;re learning running an autonomous SEO team in production.
        </p>
      </section>
      <section className="mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-24">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="panel group p-6 transition-colors duration-200"
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
      <SiteFooter />
    </main>
  );
}
