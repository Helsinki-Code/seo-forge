import { createHmac, randomBytes } from "crypto";
import { supabase } from "./supabase";

export const MCP_TOKEN_SCOPE = "ga4:read";

function pepper() {
  const value = process.env.MCP_TOKEN_PEPPER;
  if (!value || value.length < 32) {
    throw new Error("MCP_TOKEN_PEPPER must contain at least 32 characters");
  }
  return value;
}

export function hashMcpToken(token: string) {
  return createHmac("sha256", pepper()).update(token).digest("hex");
}

export function createMcpToken() {
  const token = `sfg_live_${randomBytes(32).toString("base64url")}`;
  return {
    token,
    tokenHash: hashMcpToken(token),
    tokenPrefix: token.slice(0, 13),
    lastFour: token.slice(-4),
  };
}

export type McpPrincipal = {
  tokenId: string;
  userId: string;
  siteId: string;
  scopes: string[];
};

export async function authenticateMcpRequest(request: Request): Promise<McpPrincipal | null> {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) return null;

  const now = new Date().toISOString();
  const { data } = await supabase()
    .from("mcp_tokens")
    .select("id,user_id,site_id,scopes")
    .eq("token_hash", hashMcpToken(match[1]))
    .is("revoked_at", null)
    .gt("expires_at", now)
    .maybeSingle();
  if (!data || !(data.scopes as string[]).includes(MCP_TOKEN_SCOPE)) return null;

  await supabase().from("mcp_tokens").update({ last_used_at: now }).eq("id", data.id);
  return {
    tokenId: data.id,
    userId: data.user_id,
    siteId: data.site_id,
    scopes: data.scopes,
  };
}
