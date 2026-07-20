import type { MetadataRoute } from "next";
<<<<<<< HEAD
import { posts } from "@/lib/posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://seoforge.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
=======
import { marketingPages } from "@/lib/marketing-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://seoforge.online";
  const staticPaths = ["", "/pricing", "/about", "/contact", "/how-it-works", "/blog", "/privacy", "/terms"];
  const generated = marketingPages.map((page) => `/${page.path}`);
  return [...new Set([...staticPaths, ...generated])].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" || path === "/platform" ? .9 : .7,
  }));
>>>>>>> ad9802d (seo forge real upgrade)
}
