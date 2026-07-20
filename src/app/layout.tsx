import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Fira_Code, Fira_Sans, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_DESCRIPTION =
  "An autonomous team of AI agents that reviews your website, tracks SERPs and rankings, optimizes content, and ships changes through human-approved deploys.";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: {
    default: `${SITE_NAME} — Autonomous SEO Mission Control`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: `${SITE_NAME} — Autonomous SEO Mission Control`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Autonomous SEO Mission Control`,
    description: SITE_DESCRIPTION,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  description: SITE_DESCRIPTION,
  sameAs: ["https://github.com/Helsinki-Code/seo-forge"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
=======
  title: { default: "SEOForge — Autonomous content and search operations", template: "%s | SEOForge" },
  description:
    "Two continuous agent pipelines research, create and optimize website content while a human-controlled workflow protects every production change.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://seoforge.online"),
  openGraph: { type: "website", siteName: "SEOForge", title: "SEOForge — Autonomous content and search operations", description: "Continuous content growth and search optimization with evidence, validation and human production authority." },
  twitter: { card: "summary_large_image", title: "SEOForge", description: "Autonomous content and search operations with human-controlled production." },
>>>>>>> ad9802d (seo forge real upgrade)
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", firaCode.variable, firaSans.variable, "font-sans", figtree.variable)}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
