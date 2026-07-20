import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncAgentBranches, siteRepoOf } from "@/lib/github";
import { supabase } from "@/lib/supabase";
import { getUserSite, logActivity } from "@/lib/data";

/** Scan the user's repo for agent-pushed seo-agent/* branches → PRs + approvals. */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { site } = await getUserSite(userId);
  if (!site || site.id === "demo") {
    return NextResponse.json({ error: "Connect your website first." }, { status: 400 });
  }
  if (site.platform === "wordpress") {
    return NextResponse.json({
      created: [],
      note: "WordPress site — agent changes arrive as approval cards automatically when runs finish.",
    });
  }

  try {
    const found = await syncAgentBranches(site);
    const { owner, repo } = siteRepoOf(site);

    const { data: existing } = await supabase()
      .from("approvals")
      .select("pr_number")
      .eq("site_id", site.id)
      .not("pr_number", "is", null);
    const known = new Set((existing ?? []).map((r) => r.pr_number as number));

    // Placeholder rows a handoff artifact may have already created for this
    // site (Phase R5). No session_id to match precisely here — this is a
    // manual fallback sync, not a session-scoped webhook — so claim
    // oldest-first on a best-effort basis rather than duplicating.
    const { data: placeholders } = await supabase()
      .from("approvals")
      .select("id")
      .eq("site_id", site.id)
      .eq("status", "pending")
      .eq("kind", "proposal")
      .is("pr_number", null)
      .order("created_at", { ascending: true });
    const placeholderQueue = [...(placeholders ?? [])] as { id: string }[];

    const created: typeof found = [];
    for (const c of found) {
      if (known.has(c.prNumber)) continue; // already tracked — don't duplicate
      try {
        const placeholder = placeholderQueue.shift();
        if (placeholder) {
          await supabase()
            .from("approvals")
            .update({
              title: c.title,
              kind: "pr",
              repo: `${owner}/${repo}`,
              pr_number: c.prNumber,
              detail: `Agent branch ${c.branch} — review the diff on GitHub, then approve to merge & deploy.`,
            })
            .eq("id", placeholder.id);
        } else {
          await supabase().from("approvals").insert({
            site_id: site.id,
            title: c.title,
            kind: "pr",
            repo: `${owner}/${repo}`,
            pr_number: c.prNumber,
            detail: `Agent branch ${c.branch} — review the diff on GitHub, then approve to merge & deploy.`,
            status: "pending",
          });
        }
        await logActivity(site.id, "agent", `Opened PR #${c.prNumber}: ${c.title}`);
        created.push(c);
      } catch {
        // DB best-effort; the PR itself exists either way
      }
    }
    return NextResponse.json({ created, alreadyTracked: found.length - created.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sync failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
