import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/__clerk(.*)", // Clerk auto-proxy assets (clerk.browser.js etc.)
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/how-it-works",
  "/about",
  "/pricing",
  "/blog(.*)",
  "/contact",
  "/robots.txt", // Next.js metadata route — must stay crawlable by search engines
  "/sitemap.xml", // Next.js metadata route — must stay crawlable by search engines
  "/opengraph-image(.*)", // Next.js OG image metadata routes (root + /blog/[slug])
  "/api/contact",
  "/api/cron(.*)", // protected by CRON_SECRET instead of a user session
  "/api/webhooks(.*)", // protected by HMAC signature verification
  "/api/mcp/ga4", // protected by a hashed, site-bound SEO Forge bearer token
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
