import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncAgentBranches, siteRepoOf } from "@/lib/github";
import { supabase } from "@/lib/supabase";
import { getUserSite, logActivity } from "@/lib/data";

/** Scan the user's repo for agent-pushed seo/* branches → PRs + approvals. */
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
    const created = await syncAgentBranches(site);
    const { owner, repo } = siteRepoOf(site);

    for (const c of created) {
      try {
        await supabase().from("approvals").insert({
          site_id: site.id,
          title: c.title,
          kind: "pr",
          repo: `${owner}/${repo}`,
          pr_number: c.prNumber,
          detail: `Agent branch ${c.branch} — review the diff on GitHub, then approve to merge & deploy.`,
          status: "pending",
        });
        await logActivity(site.id, "agent", `Opened PR #${c.prNumber}: ${c.title}`);
      } catch {
        // DB best-effort; the PR itself exists either way
      }
    }
    return NextResponse.json({ created });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sync failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
