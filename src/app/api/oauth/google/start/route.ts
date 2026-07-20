import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  createOAuthState,
  encryptOAuthVerifier,
  googleAuthorizationUrl,
} from "@/lib/google-analytics";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requestedSiteId = request.nextUrl.searchParams.get("siteId");
  let query = supabase().from("sites").select("id").eq("user_id", userId);
  if (requestedSiteId) query = query.eq("id", requestedSiteId);
  const { data: site, error: siteError } = await query.order("created_at").limit(1).maybeSingle();
  if (siteError || !site) {
    return NextResponse.redirect(new URL("/dashboard/connect?error=connect-site-first", request.url));
  }

  const { state, stateHash, verifier, challenge } = createOAuthState();
  const { error } = await supabase().from("google_oauth_states").insert({
    user_id: userId,
    site_id: site.id,
    state_hash: stateHash,
    code_verifier_enc: encryptOAuthVerifier(verifier),
    return_to: "/dashboard/settings",
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  if (error) {
    return NextResponse.redirect(new URL("/dashboard/settings?google=state-error", request.url));
  }

  return NextResponse.redirect(googleAuthorizationUrl(state, challenge));
}

