import type { MetadataRoute } from "next";
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
}
