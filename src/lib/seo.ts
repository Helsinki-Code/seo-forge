import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://seoforge.online";
export const SITE_NAME = "SEOForge";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Path relative to the site root, e.g. "/pricing" or "/" */
  path: string;
} & (
  | { type?: "website" }
  | { type: "article"; publishedTime: string }
);

/**
 * Builds title/description + canonical + Open Graph + Twitter Card metadata
 * for a static marketing page, so every route emits consistent, page-specific
 * social/share metadata instead of inheriting the root layout's generic tags.
 *
 * `title` should be the bare page name (e.g. "Pricing") — the root layout's
 * title.template appends " — SEO Forge" for the <title> tag automatically.
 * Open Graph/Twitter titles don't go through that template, so we append the
 * brand suffix here to keep social previews consistent.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const { title, description, path } = input;
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const socialTitle = `${title} — ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph:
      input.type === "article"
        ? {
            type: "article",
            title: socialTitle,
            description,
            url,
            siteName: SITE_NAME,
            locale: "en_US",
            publishedTime: input.publishedTime,
          }
        : {
            type: "website",
            title: socialTitle,
            description,
            url,
            siteName: SITE_NAME,
            locale: "en_US",
          },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
