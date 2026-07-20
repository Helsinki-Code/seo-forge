import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revokeGoogleGrant } from "@/lib/google-analytics";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: RouteContext<"/api/google/connections/[id]">) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const { data: connection } = await supabase()
    .from("google_connections")
    .select("id,refresh_token_enc")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!connection) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    await revokeGoogleGrant(connection.refresh_token_enc);
  } catch {
    // Local revocation still proceeds if Google already invalidated the grant.
  }
  const now = new Date().toISOString();
  await supabase().from("google_resources").update({ site_id: null, selected_at: null, updated_at: now }).eq("connection_id", id).eq("user_id", userId);
  const { error } = await supabase()
    .from("google_connections")
    .update({ status: "revoked", revoked_at: now, updated_at: now })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true });
}
