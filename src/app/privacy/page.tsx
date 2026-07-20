import Link from "next/link";
<<<<<<< HEAD
import { pageMetadata } from "@/lib/seo";
=======
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
>>>>>>> ad9802d (seo forge real upgrade)

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How SEO Forge collects, uses, and protects the data behind your account, rankings, and agent runs.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="marketing-shell min-h-screen"><SiteHeader /><article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-xs text-primary hover:underline">
        ← seoforge.online
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-xs text-fg-faint">Last updated: July 10, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-fg-mute">
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">What we collect</h2>
          <p>
            SEOForge stores your account details, the keywords, rankings, agent
            runs, approvals, and media records you create in the dashboard (in Supabase), and
            operational logs needed to run the service.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">How it&apos;s used</h2>
          <p>
            Your data powers the autonomous SEO workflows you trigger: agent sessions on the
            configured model providers, SERP analysis, content workflows, and authorized GitHub
            or WordPress delivery. We do not sell your data or use it for advertising.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Third-party services</h2>
          <p>
            SEOForge uses infrastructure, authentication, database, model, analytics,
            repository, CMS and communications providers. The current subprocessor page
            documents approved providers and their processing purposes.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Your rights</h2>
          <p>
            You can export or delete your data at any time. Contact us and we&apos;ll action
            deletion requests within 30 days.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Contact</h2>
          <p>Questions? Reach the operator of seoforge.online via the site&apos;s contact channel.</p>
        </section>
      </div>
    </article><SiteFooter /></main>
  );
}
