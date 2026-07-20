import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(_request: Request, context: RouteContext<"/api/mcp/tokens/[id]">) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const { data, error } = await supabase()
    .from("mcp_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not revoke MCP token" }, { status: 503 });
  if (!data) return NextResponse.json({ error: "token not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
