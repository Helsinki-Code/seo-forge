import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createMcpToken, MCP_TOKEN_SCOPE } from "@/lib/mcp-auth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const CreateToken = z.object({
  siteId: z.string().uuid(),
  label: z.string().trim().min(1).max(80).default("GA4 MCP client"),
  expiresInDays: z.number().int().min(1).max(365).default(90),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await supabase()
    .from("mcp_tokens")
    .select("id,site_id,label,token_prefix,last_four,scopes,expires_at,last_used_at,revoked_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not load MCP tokens" }, { status: 503 });
  return NextResponse.json({ tokens: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = CreateToken.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid token request" }, { status: 400 });

  const { data: site } = await supabase()
    .from("sites")
    .select("id")
    .eq("id", parsed.data.siteId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "site not found" }, { status: 404 });

  const generated = createMcpToken();
  const expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 86_400_000).toISOString();
  const { data, error } = await supabase()
    .from("mcp_tokens")
    .insert({
      user_id: userId,
      site_id: site.id,
      label: parsed.data.label,
      token_hash: generated.tokenHash,
      token_prefix: generated.tokenPrefix,
      last_four: generated.lastFour,
      scopes: [MCP_TOKEN_SCOPE],
      expires_at: expiresAt,
    })
    .select("id,label,site_id,token_prefix,last_four,scopes,expires_at,created_at")
    .single();
  if (error) return NextResponse.json({ error: "Could not create MCP token" }, { status: 503 });

  return NextResponse.json({ token: generated.token, metadata: data }, { status: 201 });
}
