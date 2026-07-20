import { createHash, randomBytes } from "crypto";
import { decryptSecret, encryptSecret } from "./crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const ANALYTICS_ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta";
const ANALYTICS_DATA_BASE = "https://analyticsdata.googleapis.com";

export const GOOGLE_ANALYTICS_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/analytics.readonly",
] as const;

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
  id_token?: string;
};

export type StoredGoogleCredentials = {
  refreshToken: string;
};

export type GoogleConnectionRow = {
  id: string;
  user_id: string;
  google_subject: string;
  email: string;
  refresh_token_enc: string;
  scopes: string[];
  status: "active" | "expired" | "revoked" | "error";
};

export type GoogleAnalyticsProperty = {
  externalId: string;
  displayName: string;
  accountId: string;
  accountName: string;
  propertyType?: string;
  parent?: string;
};

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth is not configured");
  }
  return { clientId, clientSecret, redirectUri };
}

async function googleJson<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google API ${response.status}: ${detail.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

export function createOAuthState() {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(64).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return {
    state,
    stateHash: createHash("sha256").update(state).digest("hex"),
    verifier,
    challenge,
  };
}

export function hashOAuthState(state: string) {
  return createHash("sha256").update(state).digest("hex");
}

export function encryptOAuthVerifier(verifier: string) {
  return encryptSecret(verifier);
}

export function decryptOAuthVerifier(value: string) {
  return decryptSecret(value);
}

export function googleAuthorizationUrl(state: string, challenge: string) {
  const { clientId, redirectUri } = config();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: GOOGLE_ANALYTICS_SCOPES.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${GOOGLE_AUTH_URL}?${params}`;
}

export async function exchangeGoogleCode(code: string, verifier: string) {
  const { clientId, clientSecret, redirectUri } = config();
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google OAuth exchange failed (${response.status})`);
  return response.json() as Promise<GoogleTokenResponse>;
}

export async function refreshGoogleToken(connection: GoogleConnectionRow) {
  if (connection.status !== "active") throw new Error("Google Analytics connection is not active");
  const { clientId, clientSecret } = config();
  const stored = JSON.parse(decryptSecret(connection.refresh_token_enc)) as StoredGoogleCredentials;
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: stored.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google access-token refresh failed (${response.status})`);
  return response.json() as Promise<GoogleTokenResponse>;
}

export function encryptGoogleRefreshToken(refreshToken: string) {
  return encryptSecret(JSON.stringify({ refreshToken } satisfies StoredGoogleCredentials));
}

export async function getGoogleUser(accessToken: string) {
  return googleJson<{ sub: string; email: string; email_verified?: boolean }>(
    GOOGLE_USERINFO_URL,
    accessToken,
  );
}

export async function listGoogleAnalyticsProperties(accessToken: string) {
  type PropertySummary = {
    property: string;
    displayName: string;
    propertyType?: string;
    parent?: string;
  };
  type AccountSummary = {
    account: string;
    displayName: string;
    propertySummaries?: PropertySummary[];
  };
  type Page = { accountSummaries?: AccountSummary[]; nextPageToken?: string };

  const properties: GoogleAnalyticsProperty[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({ pageSize: "200" });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await googleJson<Page>(`${ANALYTICS_ADMIN_BASE}/accountSummaries?${params}`, accessToken);
    for (const account of page.accountSummaries ?? []) {
      for (const property of account.propertySummaries ?? []) {
        properties.push({
          externalId: property.property.replace("properties/", ""),
          displayName: property.displayName,
          accountId: account.account.replace("accounts/", ""),
          accountName: account.displayName,
          propertyType: property.propertyType,
          parent: property.parent,
        });
      }
    }
    pageToken = page.nextPageToken ?? "";
  } while (pageToken);
  return properties;
}

export async function revokeGoogleGrant(refreshTokenEnc: string) {
  const stored = JSON.parse(decryptSecret(refreshTokenEnc)) as StoredGoogleCredentials;
  const response = await fetch(GOOGLE_REVOKE_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: stored.refreshToken }),
    cache: "no-store",
  });
  if (!response.ok && response.status !== 400) {
    throw new Error(`Google token revocation failed (${response.status})`);
  }
}

export async function callGoogleAnalytics(
  accessToken: string,
  propertyId: string,
  action: string,
  request: Record<string, unknown> = {},
) {
  const property = `properties/${propertyId.replace("properties/", "")}`;
  switch (action) {
    case "property_details":
      return googleJson(`${ANALYTICS_ADMIN_BASE}/${property}`, accessToken);
    case "google_ads_links":
      return googleJson(`${ANALYTICS_ADMIN_BASE}/${property}/googleAdsLinks`, accessToken);
    case "property_annotations":
      return googleJson(
        `https://analyticsadmin.googleapis.com/v1alpha/${property}/reportingDataAnnotations`,
        accessToken,
      );
    case "custom_dimensions_and_metrics": {
      const metadata = await googleJson<{
        dimensions?: Array<Record<string, unknown> & { customDefinition?: boolean }>;
        metrics?: Array<Record<string, unknown> & { customDefinition?: boolean }>;
      }>(`${ANALYTICS_DATA_BASE}/v1beta/${property}/metadata`, accessToken);
      return {
        custom_dimensions: (metadata.dimensions ?? []).filter((item) => item.customDefinition),
        custom_metrics: (metadata.metrics ?? []).filter((item) => item.customDefinition),
      };
    }
    case "run_report":
      return googleJson(`${ANALYTICS_DATA_BASE}/v1beta/${property}:runReport`, accessToken, {
        method: "POST",
        body: JSON.stringify(request),
      });
    case "run_realtime_report":
      return googleJson(`${ANALYTICS_DATA_BASE}/v1beta/${property}:runRealtimeReport`, accessToken, {
        method: "POST",
        body: JSON.stringify(request),
      });
    case "run_funnel_report":
      return googleJson(`${ANALYTICS_DATA_BASE}/v1alpha/${property}:runFunnelReport`, accessToken, {
        method: "POST",
        body: JSON.stringify(request),
      });
    case "run_conversions_report":
      return googleJson(`${ANALYTICS_DATA_BASE}/v1beta/${property}:runReport`, accessToken, {
        method: "POST",
        body: JSON.stringify(request),
      });
    default:
      throw new Error("Unsupported Google Analytics action");
  }
}
