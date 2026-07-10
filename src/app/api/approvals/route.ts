import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { closePR, mergePR, siteRepo } from "@/lib/github";
import { supabase } from "@/lib/supabase";
import { getSite, logActivity } from "@/lib/data";

const Body = z.object({
  action: z.enum(["approve", "reject"]),
  approvalId: z.string().optional(), // supabase approvals row
  prNumber: z.number().int().positive().optional(), // direct GitHub PR
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { action, approvalId, prNumber, title } = parsed.data;
  const results: Record<string, unknown> = {};

  // 1. GitHub side — merge (deploys via the repo's pipeline) or close
  if (prNumber) {
    try {
      if (action === "approve") {
        const res = await mergePR(prNumber);
        results.github = { merged: res.data.merged, sha: res.data.sha };
      } else {
        await closePR(prNumber);
        results.github = { closed: true };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "github error";
      return NextResponse.json({ error: `GitHub: ${msg}` }, { status: 502 });
    }
  }

  // 2. Record the decision
  const status = action === "approve" ? (prNumber ? "merged" : "approved") : "rejected";
  try {
    if (approvalId && approvalId !== "demo") {
      await supabase()
        .from("approvals")
        .update({ status, decided_at: new Date().toISOString() })
        .eq("id", approvalId);
    }
    const { data: site } = await getSite();
    if (site && site.id !== "demo") {
      const { owner, repo } = siteRepo();
      await logActivity(
        site.id,
        "human",
        `${action === "approve" ? "Approved" : "Rejected"}: ${title ?? approvalId ?? `PR #${prNumber}`}${
          prNumber ? ` (${owner}/${repo}#${prNumber})` : ""
        }`,
      );
    }
  } catch {
    // DB not ready — GitHub action already succeeded
  }

  return NextResponse.json({ ok: true, status, ...results });
}
