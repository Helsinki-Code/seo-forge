import Link from "next/link";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-amber" aria-hidden />
            <span className="display text-sm font-semibold">
              SEO<span className="text-primary">Forge</span>
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-fg-faint">
            Autonomous SEO agents. Human-approved deploys.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-faint">
              {c.title}
            </p>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-fg-mute transition-colors duration-200 hover:text-fg"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-edge py-6 text-center text-xs text-fg-faint">
        © {new Date().getFullYear()} SEO Forge · seoforge.online
      </p>
    </footer>
  );
}
