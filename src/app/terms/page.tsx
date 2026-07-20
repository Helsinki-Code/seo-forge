import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata = { title: "Terms of Service — SEO Forge" };

export default function TermsPage() {
  return (
    <main className="marketing-shell min-h-screen"><SiteHeader /><article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-xs text-primary hover:underline">
        ← seoforge.online
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-xs text-fg-faint">Last updated: July 10, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-fg-mute">
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">The service</h2>
          <p>
            SEO Forge provides an AI-agent-powered SEO operations dashboard. Agents propose
            website changes; changes only reach production after a human approves the
            corresponding GitHub or WordPress production proposal.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Your responsibilities</h2>
          <p>
            You are responsible for the websites you connect, the repositories you authorize,
            and every change you approve. Review agent-proposed changes before merging.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">No ranking guarantees</h2>
          <p>
            Search rankings are determined by third-party search engines. SEO Forge optimizes
            persistently toward better positions but cannot and does not guarantee any specific
            ranking outcome.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Liability</h2>
          <p>
            The service is provided &quot;as is&quot; without warranties. To the maximum extent
            permitted by law, we are not liable for indirect or consequential damages arising
            from use of the service.
          </p>
        </section>
      </div>
    </article><SiteFooter /></main>
  );
}
