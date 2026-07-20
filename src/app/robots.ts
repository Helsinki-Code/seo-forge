import type { MetadataRoute } from "next";

<<<<<<< HEAD
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://seoforge.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/api/",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
=======
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://seoforge.online";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/sign-in/", "/sign-up/"] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
>>>>>>> ad9802d (seo forge real upgrade)
  };
}
