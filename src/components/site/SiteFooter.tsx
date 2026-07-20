import Link from "next/link";

const columns = [
  { title: "Platform", links: [["/platform/content-growth", "Content Growth"], ["/platform/search-optimization", "Search Optimization"], ["/platform/workflow-supervisor", "Workflow Supervisor"], ["/platform/site-experience-engineer", "Site Engineer"], ["/platform/human-approval", "Human approval"]] },
  { title: "Solutions", links: [["/solutions/saas", "SaaS"], ["/solutions/ecommerce", "Ecommerce"], ["/solutions/agencies", "Agencies"], ["/solutions/publishers", "Publishers"], ["/solutions/local-businesses", "Local business"]] },
  { title: "Resources", links: [["/how-it-works", "How it works"], ["/integrations", "Integrations"], ["/guides", "Guides"], ["/templates", "Templates"], ["/glossary", "Glossary"], ["/blog", "Blog"]] },
  { title: "Company", links: [["/about", "About"], ["/pricing", "Pricing"], ["/demo", "Book a demo"], ["/security", "Security"], ["/trust", "Trust center"], ["/contact", "Contact"]] },
  { title: "Developers", links: [["/developers", "Developer platform"], ["/docs", "Documentation"], ["/api", "REST API"], ["/mcp", "Remote MCP"], ["/webhooks", "Webhooks"], ["/status", "Status"]] },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-edge bg-panel/35">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_3fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-sm font-semibold text-primary">S</span><span className="display font-semibold">SEO<span className="text-primary">Forge</span></span></Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-fg-mute">Two continuous organic-growth pipelines, one accountable Supervisor and one protected path to production.</p>
          <p className="mt-5 text-xs text-fg-faint">Rankings are measured outcomes, never guarantees.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((column) => <div key={column.title}><p className="text-xs font-semibold uppercase tracking-[.16em] text-fg-faint">{column.title}</p><ul className="mt-4 space-y-3">{column.links.map(([href, label]) => <li key={href}><Link href={href} className="text-sm text-fg-mute transition hover:text-fg">{label}</Link></li>)}</ul></div>)}
        </div>
      </div>
      <div className="border-t border-edge"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-fg-faint"><p>© {new Date().getFullYear()} SEOForge. Autonomous research, human authority.</p><div className="flex gap-5"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/acceptable-use">Acceptable use</Link></div></div></div>
    </footer>
  );
}
