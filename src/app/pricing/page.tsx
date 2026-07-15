import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { SignUpButton, Show } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description: "Simple plans for autonomous SEO with human-approved deploys.",
  path: "/pricing",
});

const tiers = [
  {
    name: "Solo",
    price: "$49",
    tagline: "One site, full agent team",
    features: [
      "1 website",
      "25 tracked keywords",
      "Nightly autonomous reviews",
      "Human-approved PR deploys",
      "On-brand media generation",
    ],
    highlighted: false,
  },
  {
    name: "Studio",
    price: "$149",
    tagline: "For operators running multiple properties",
    features: [
      "5 websites",
      "150 tracked keywords",
      "Hourly SERP watch on hero keywords",
      "Priority agent scheduling",
      "Affiliate opportunity mapping",
      "Webhook + API access",
    ],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    tagline: "Agencies and portfolios",
    features: [
      "Unlimited websites",
      "Custom keyword volume",
      "Dedicated agent environments",
      "Custom approval workflows",
      "White-glove onboarding",
    ],
    highlighted: false,
  },
];

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${SITE_NAME} — Autonomous SEO Agent Team`,
  description: "Simple plans for autonomous SEO with human-approved deploys.",
  brand: {
    "@type": "Brand",
    name: SITE_NAME,
  },
  url: `${SITE_URL}/pricing`,
  offers: tiers
    .filter((t) => t.price.startsWith("$"))
    .map((t) => ({
      "@type": "Offer",
      name: `${SITE_NAME} ${t.name}`,
      description: t.tagline,
      price: t.price.replace("$", ""),
      priceCurrency: "USD",
      url: `${SITE_URL}/pricing`,
      availability: "https://schema.org/InStock",
    })),
};

export default function PricingPage() {
  return (
    <main className="grid-fade min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Pay for the team, <span className="text-primary glow-primary">keep the rankings</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-fg-mute">
          Every plan includes the full eight-agent team and the human-in-the-loop deploy
          gate. Prices are per month.
        </p>
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`panel flex flex-col p-7 ${
              t.highlighted ? "border-primary/60 shadow-[0_0_40px_-12px_rgba(59,130,246,0.45)]" : ""
            }`}
          >
            {t.highlighted && (
              <span className="mb-3 w-fit rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium text-primary">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-semibold">{t.name}</h2>
            <p className="mt-1 text-xs text-fg-mute">{t.tagline}</p>
            <p className="display mt-5 text-4xl font-bold">
              {t.price}
              {t.price.startsWith("$") && (
                <span className="text-sm font-normal text-fg-faint">/mo</span>
              )}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-fg-mute">
                  <Check size={15} className="mt-0.5 shrink-0 text-mint" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Show when="signed-out">
                <SignUpButton>
                  <button
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      t.highlighted
                        ? "bg-amber text-ink hover:bg-amber-400"
                        : "bg-primary text-white hover:bg-primary-dim"
                    }`}
                  >
                    {t.price === "Custom" ? "Talk to us" : "Start now"}
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href={t.price === "Custom" ? "/contact" : "/dashboard"}
                  className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors duration-200 ${
                    t.highlighted
                      ? "bg-amber text-ink hover:bg-amber-400"
                      : "bg-primary text-white hover:bg-primary-dim"
                  }`}
                >
                  {t.price === "Custom" ? "Talk to us" : "Open dashboard"}
                </Link>
              </Show>
            </div>
          </div>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
