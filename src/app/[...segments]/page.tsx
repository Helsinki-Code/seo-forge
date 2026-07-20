import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingPage from "@/components/marketing/MarketingPage";
import { getMarketingPage, marketingPages } from "@/lib/marketing-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return marketingPages.map((page) => ({ segments: page.path.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ segments: string[] }> }): Promise<Metadata> {
  const { segments } = await params;
  const page = getMarketingPage(segments.join("/"));
  if (!page) return { title: "Page not found — SEOForge" };
  return {
    title: `${page.title} — SEOForge`,
    description: page.description,
    alternates: { canonical: `/${page.path}` },
    openGraph: { title: page.title, description: page.description, type: "website", url: `/${page.path}` },
  };
}

export default async function DynamicMarketingPage({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  const page = getMarketingPage(segments.join("/"));
  if (!page) notFound();
  return <MarketingPage page={page} />;
}
