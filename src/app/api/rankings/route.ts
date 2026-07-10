import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getKeywords, getSnapshots, getUserSite } from "@/lib/data";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { site, demo } = await getUserSite(userId);
  if (!site) return NextResponse.json({ keywords: [], snapshots: [], demo });
  const { data: keywords } = await getKeywords(site.id);
  const { data: snapshots } = await getSnapshots(keywords.map((k) => k.id));
  return NextResponse.json({ keywords, snapshots, demo });
}

const Body = z.object({
  keyword: z.string().min(2).max(120),
  targetUrl: z.string().max(300).optional(),
  priority: z.number().int().min(1).max(5).default(3),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { site } = await getUserSite(userId);
  if (!site || site.id === "demo") {
    return NextResponse.json({ error: "Connect your website first." }, { status: 400 });
  }

  try {
    const { data, error } = await supabase()
      .from("keywords")
      .insert({
        site_id: site.id,
        keyword: parsed.data.keyword,
        target_url: parsed.data.targetUrl ?? null,
        priority: parsed.data.priority,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ keyword: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db error";
    return NextResponse.json(
      { error: `Database not ready (${msg}). Run supabase/schema.sql first.` },
      { status: 503 },
    );
  }
}
