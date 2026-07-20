import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { ArrowRight, ChevronDown } from "lucide-react";

type NavGroup = { label: string; links: readonly (readonly [string, string, string])[] };

const groups: readonly NavGroup[] = [
  {
    label: "Platform",
    links: [
      ["/platform", "Platform overview", "One control room for continuous organic growth."],
      ["/platform/content-growth", "Content Growth", "Research, briefs, articles, media and measurement."],
      ["/platform/search-optimization", "Search Optimization", "Rankings, technical health and existing-content gains."],
      ["/platform/workflow-supervisor", "Workflow Supervisor", "Coordinates schedules, budgets and approvals."],
      ["/platform/site-experience-engineer", "Site Experience Engineer", "Turns approved work into website-native changes."],
    ],
  },
  {
    label: "Solutions",
    links: [
      ["/solutions/saas", "SaaS", "Build durable product-led organic growth."],
      ["/solutions/ecommerce", "Ecommerce", "Optimize collections, products and commercial content."],
      ["/solutions/agencies", "Agencies", "Operate multiple client sites with isolation."],
      ["/solutions/publishers", "Publishers", "Plan, publish and refresh an editorial portfolio."],
      ["/solutions/local-business", "Local businesses", "Track markets, entities and local opportunities."],
    ],
  },
  {
    label: "Use cases",
    links: [
      ["/use-cases/create-new-content", "Launch and scale content", "Turn validated opportunities into an editorial system."],
      ["/use-cases/improve-existing-content", "Improve existing content", "Refresh pages without losing provenance."],
      ["/use-cases/fix-technical-seo", "Fix technical SEO", "Turn technical evidence into validated changes."],
      ["/use-cases/increase-ai-visibility", "Increase AI visibility", "Measure approved citation probes responsibly."],
      ["/use-cases/manage-multiple-websites", "Manage multiple sites", "Coordinate isolated sites and approvals."],
    ],
  },
  {
    label: "Resources",
    links: [
      ["/how-it-works", "How it works", "See the complete protected workflow."],
      ["/integrations", "Integrations", "Connect publishing and measurement providers."],
      ["/guides", "SEO guides", "Practical guides for modern search teams."],
      ["/templates", "Templates", "Briefs, audits and workflow templates."],
      ["/blog", "Blog", "Research and product thinking from SEOForge."],
      ["/developers", "Developers", "API, MCP, webhooks and SDK resources."],
    ],
  },
];

export default function SiteHeader() {
  return (
    <header className="marketing-header sticky top-0 z-50 border-b border-edge/80 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="SEOForge home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/12 text-sm font-semibold text-primary">S</span>
          <span className="display text-base font-semibold tracking-tight">SEO<span className="text-primary">Forge</span></span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {groups.map((group) => (
            <details key={group.label} className="nav-group relative">
              <summary className="flex list-none items-center gap-1 rounded-lg px-3 py-2 text-sm text-fg-mute transition hover:bg-panel hover:text-fg">
                {group.label}<ChevronDown size={13} aria-hidden />
              </summary>
              <div className="nav-menu absolute left-1/2 top-[calc(100%+.65rem)] hidden w-[34rem] -translate-x-1/2 grid-cols-2 gap-2 rounded-2xl border border-edge bg-panel/98 p-3 shadow-2xl shadow-black/45 group-open:grid">
                {group.links.map(([href, label, description]) => (
                  <Link key={href} href={href} className="rounded-xl border border-transparent p-3 transition hover:border-edge hover:bg-panel-2">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-1 block text-xs leading-5 text-fg-faint">{description}</span>
                  </Link>
                ))}
              </div>
            </details>
          ))}
          <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm text-fg-mute transition hover:bg-panel hover:text-fg">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <Link href="/sign-in" className="hidden rounded-lg px-3 py-2 text-sm text-fg-mute transition hover:text-fg sm:block">Sign in</Link>
            <Link href="/pricing" className="marketing-button marketing-button-primary !min-h-9 !px-4 !py-2 text-xs">Choose Your Plan <ArrowRight size={14} /></Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="marketing-button marketing-button-primary !min-h-9 !px-4 !py-2 text-xs">Mission Control</Link>
            <UserButton />
          </Show>
        </div>
      </div>

      <details className="border-t border-edge/60 lg:hidden">
        <summary className="mx-auto flex max-w-7xl list-none items-center justify-between px-6 py-3 text-xs font-semibold uppercase tracking-[.15em] text-fg-mute">Explore SEOForge <ChevronDown size={14} /></summary>
        <nav className="mx-auto grid max-w-7xl gap-2 border-t border-edge/60 px-6 py-4 sm:grid-cols-2" aria-label="Mobile navigation">
          {groups.flatMap((group) => group.links.slice(0, 3)).map(([href, label]) => <Link key={href} href={href} className="rounded-lg border border-edge bg-panel px-4 py-3 text-sm">{label}</Link>)}
          <Link href="/pricing" className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">Pricing</Link>
        </nav>
      </details>
    </header>
  );
}
