import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getUserSite, getFindings, logActivity, type Finding } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { site, demo } = await getUserSite(userId);
  if (!site) return NextResponse.json({ findings: [], demo });

  const status = req.nextUrl.searchParams.get("status") as Finding["status"] | null;
  const { data: findings } = await getFindings(site.id, status ?? undefined);
  return NextResponse.json({ findings, demo });
}

const Body = z.object({
  action: z.enum(["accept", "dismiss", "defer", "assign", "reopen"]),
  findingIds: z.array(z.string()).min(1).max(100),
  assignee: z.string().max(120).optional(),
});

const ACTION_STATUS: Record<string, Finding["status"]> = {
  accept: "accepted",
  dismiss: "dismissed",
  defer: "deferred",
  reopen: "open",
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { action, findingIds, assignee } = parsed.data;

  const { site } = await getUserSite(userId);
  if (!site || site.id === "demo") {
    return NextResponse.json({ error: "Connect your website first." }, { status: 400 });
  }

  try {
    // Scope to this site's own findings before mutating anything.
    const { data: owned, error: ownedErr } = await supabase()
      .from("findings")
      .select("id, status, resolution_history")
      .eq("site_id", site.id)
      .in("id", findingIds);
    if (ownedErr) throw ownedErr;
    const rows = (owned ?? []) as { id: string; status: string; resolution_history: unknown[] }[];

    let updated = 0;
    for (const row of rows) {
      const entry = { at: new Date().toISOString(), action, by: "human" };
      const update: Record<string, unknown> = {
        resolution_history: [...(row.resolution_history ?? []), entry],
      };
      if (action === "assign") {
        update.assigned_to = assignee ?? null;
      } else {
        update.status = ACTION_STATUS[action];
        update.resolved_at = action === "reopen" ? null : new Date().toISOString();
      }
      const { error } = await supabase().from("findings").update(update).eq("id", row.id);
      if (!error) updated++;
    }

    if (updated > 0) {
      await logActivity(
        site.id,
        "human",
        `${action} ${updated} finding${updated > 1 ? "s" : ""}${assignee ? ` → ${assignee}` : ""}`,
      );
    }

    return NextResponse.json({ updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "update failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
