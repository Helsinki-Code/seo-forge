import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { closePR, mergePR, siteRepoOf } from "@/lib/github";
import { applyWpChange, WpChange } from "@/lib/wordpress";
import { supabase } from "@/lib/supabase";
import { getUserSite, logActivity, Approval } from "@/lib/data";

const Body = z.object({
  action: z.enum(["approve", "reject"]),
  approvalId: z.string().optional(), // supabase approvals row (wp changes live here)
  prNumber: z.number().int().positive().optional(), // GitHub PR
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

  const { site } = await getUserSite(userId);
  if (!site || site.id === "demo") {
    return NextResponse.json({ error: "Connect your website first." }, { status: 400 });
  }

  const results: Record<string, unknown> = {};

  // Load the approval row (authorized: must belong to this user's site)
  let approval: Approval | null = null;
  if (approvalId && approvalId !== "demo") {
    try {
      const { data } = await supabase()
        .from("approvals")
        .select("*")
        .eq("id", approvalId)
        .eq("site_id", site.id)
        .single();
      approval = data as Approval;
    } catch {
      approval = null;
    }
  }

  try {
    if (action === "approve") {
      if (prNumber) {
        // GitHub path: merging deploys via the user's own pipeline
        const res = await mergePR(site, prNumber);
        results.github = { merged: res.data.merged, sha: res.data.sha };
      } else if (approval?.payload && (approval.kind === "wp_update" || approval.kind === "wp_new")) {
        // WordPress path: apply the agent's structured change via WP REST API
        const applied = await applyWpChange(site, approval.payload as unknown as WpChange);
        results.wordpress = { applied: true, postId: applied?.id };
      }
    } else if (prNumber) {
      await closePR(site, prNumber);
      results.github = { closed: true };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "apply failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const status =
    action === "approve" ? (prNumber ? "merged" : "approved") : "rejected";
  try {
    if (approvalId && approvalId !== "demo") {
      await supabase()
        .from("approvals")
        .update({ status, decided_at: new Date().toISOString() })
        .eq("id", approvalId)
        .eq("site_id", site.id);
    }
    const label = title ?? approval?.title ?? (prNumber ? `PR #${prNumber}` : approvalId);
    let repoNote = "";
    if (prNumber) {
      try {
        const { owner, repo } = siteRepoOf(site);
        repoNote = ` (${owner}/${repo}#${prNumber})`;
      } catch {
        repoNote = ` (PR #${prNumber})`;
      }
    }
    await logActivity(
      site.id,
      "human",
      `${action === "approve" ? "Approved" : "Rejected"}: ${label}${repoNote}`,
    );
  } catch {
    // DB best-effort; the change itself already applied
  }

  return NextResponse.json({ ok: true, status, ...results });
}
