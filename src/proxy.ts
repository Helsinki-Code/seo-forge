import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public APIs authenticate with their own purpose-built mechanism instead of a
 * browser Clerk session. Every other API route remains Clerk-protected.
 */
const isPublicApiRoute = createRouteMatcher([
  "/api/contact",
  "/api/cron(.*)", // CRON_SECRET
  "/api/webhooks(.*)", // provider signature/HMAC verification
  "/api/mcp/ga4", // hashed, site-bound SEOForge bearer token
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // The customer control room always requires an authenticated Clerk session.
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    await auth.protect();
    return;
  }

  // APIs are private by default. Only the explicitly listed routes above use
  // their own authentication scheme.
  if (pathname.startsWith("/api/") && !isPublicApiRoute(request)) {
    await auth.protect();
  }

  // All non-dashboard website routes are public: platform, agents, solutions,
  // use cases, integrations, resources, guides, comparisons, legal and blog.
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
