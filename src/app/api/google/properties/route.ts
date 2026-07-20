import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const Selection = z.object({ siteId: z.string().uuid(), resourceId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Selection.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid selection" }, { status: 400 });

  const { siteId, resourceId } = parsed.data;
  const [{ data: site }, { data: resource }] = await Promise.all([
    supabase().from("sites").select("id").eq("id", siteId).eq("user_id", userId).maybeSingle(),
    supabase().from("google_resources").select("id,connection_id").eq("id", resourceId).eq("user_id", userId).eq("resource_type", "ga4_property").maybeSingle(),
  ]);
  if (!site || !resource) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { data: connection } = await supabase()
    .from("google_connections")
    .select("id")
    .eq("id", resource.connection_id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (!connection) return NextResponse.json({ error: "Google connection is not active" }, { status: 409 });

  const now = new Date().toISOString();
  const { error: clearError } = await supabase()
    .from("google_resources")
    .update({ site_id: null, selected_at: null, updated_at: now })
    .eq("user_id", userId)
    .eq("site_id", siteId)
    .eq("resource_type", "ga4_property");
  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 503 });

  const { error } = await supabase()
    .from("google_resources")
    .update({ site_id: siteId, selected_at: now, updated_at: now })
    .eq("id", resourceId)
    .eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true });
}
