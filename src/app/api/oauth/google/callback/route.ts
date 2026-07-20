import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { decryptSecret } from "@/lib/crypto";
import { supabase } from "@/lib/supabase";
import {
  decryptOAuthVerifier,
  encryptGoogleRefreshToken,
  exchangeGoogleCode,
  getGoogleUser,
  hashOAuthState,
  listGoogleAnalyticsProperties,
  type StoredGoogleCredentials,
} from "@/lib/google-analytics";

export const runtime = "nodejs";

function settingsRedirect(request: NextRequest, result: string) {
  return NextResponse.redirect(new URL(`/dashboard/settings?google=${encodeURIComponent(result)}`, request.url));
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));

  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError) return settingsRedirect(request, `denied-${oauthError}`);
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  if (!state || !code) return settingsRedirect(request, "invalid-callback");

  const now = new Date().toISOString();
  const { data: oauthState, error: stateError } = await supabase()
    .from("google_oauth_states")
    .update({ used_at: now })
    .eq("user_id", userId)
    .eq("state_hash", hashOAuthState(state))
    .is("used_at", null)
    .gt("expires_at", now)
    .select("id,site_id,code_verifier_enc")
    .maybeSingle();
  if (stateError || !oauthState) return settingsRedirect(request, "invalid-or-expired-state");

  try {
    const verifier = decryptOAuthVerifier(oauthState.code_verifier_enc);
    const tokens = await exchangeGoogleCode(code, verifier);
    const profile = await getGoogleUser(tokens.access_token);
    if (!profile.email || !profile.sub) throw new Error("Google account identity was not returned");

    const { data: existing } = await supabase()
      .from("google_connections")
      .select("id,refresh_token_enc")
      .eq("user_id", userId)
      .eq("google_subject", profile.sub)
      .maybeSingle();

    let refreshToken = tokens.refresh_token;
    if (!refreshToken && existing?.refresh_token_enc) {
      const stored = JSON.parse(decryptSecret(existing.refresh_token_enc)) as StoredGoogleCredentials;
      refreshToken = stored.refreshToken;
    }
    if (!refreshToken) throw new Error("Google did not return offline access; reconnect and approve consent");

    const scopes = (tokens.scope ?? "").split(" ").filter(Boolean);
    const connectionRow = {
      user_id: userId,
      google_subject: profile.sub,
      email: profile.email,
      refresh_token_enc: encryptGoogleRefreshToken(refreshToken),
      scopes,
      status: "active",
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      last_verified_at: now,
      last_error: null,
      revoked_at: null,
      updated_at: now,
    };
    const { data: connection, error: connectionError } = await supabase()
      .from("google_connections")
      .upsert(connectionRow, { onConflict: "user_id,google_subject" })
      .select("id")
      .single();
    if (connectionError) throw connectionError;

    const properties = await listGoogleAnalyticsProperties(tokens.access_token);
    if (properties.length) {
      const { error: resourceError } = await supabase().from("google_resources").upsert(
        properties.map((property) => ({
          user_id: userId,
          connection_id: connection.id,
          resource_type: "ga4_property",
          external_id: property.externalId,
          display_name: property.displayName,
          account_id: property.accountId,
          account_name: property.accountName,
          metadata: { propertyType: property.propertyType, parent: property.parent },
          discovered_at: now,
          updated_at: now,
        })),
        { onConflict: "connection_id,resource_type,external_id" },
      );
      if (resourceError) throw resourceError;
    }

    const { data: alreadySelected } = await supabase()
      .from("google_resources")
      .select("id")
      .eq("user_id", userId)
      .eq("site_id", oauthState.site_id)
      .eq("resource_type", "ga4_property")
      .maybeSingle();
    if (!alreadySelected && properties.length === 1) {
      await supabase()
        .from("google_resources")
        .update({ site_id: oauthState.site_id, selected_at: now, updated_at: now })
        .eq("connection_id", connection.id)
        .eq("external_id", properties[0].externalId);
    }

    return settingsRedirect(request, properties.length ? "connected" : "connected-no-properties");
  } catch {
    return settingsRedirect(request, "error-connection-failed");
  }
}
