import Link from "next/link";

export const metadata = { title: "Privacy Policy — SEO Forge" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-xs text-primary hover:underline">
        ← seoforge.online
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-xs text-fg-faint">Last updated: July 10, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-fg-mute">
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">What we collect</h2>
          <p>
            SEO Forge stores your account details (via Clerk), the keywords, rankings, agent
            runs, approvals, and media records you create in the dashboard (in Supabase), and
            operational logs needed to run the service.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">How it&apos;s used</h2>
          <p>
            Your data powers the autonomous SEO workflows you trigger: agent sessions on the
            Anthropic platform, SERP analysis, content optimization, and GitHub pull-request
            deploys. We do not sell your data or use it for advertising.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Third-party services</h2>
          <p>
            SEO Forge integrates Clerk (authentication), Supabase (database), Anthropic
            (agent execution), GitHub (deploys), and Vercel (hosting). Each processes data
            under its own privacy policy.
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
    </main>
  );
}
