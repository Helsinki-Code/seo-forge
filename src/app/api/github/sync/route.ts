import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncAgentBranches, siteRepo } from "@/lib/github";
import { supabase } from "@/lib/supabase";
import { getSite, logActivity } from "@/lib/data";

/** Scan for agent-pushed seo/* branches and open PRs + approval entries. */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const created = await syncAgentBranches();
    const { data: site } = await getSite();
    const { owner, repo } = siteRepo();

    for (const c of created) {
      try {
        await supabase().from("approvals").insert({
          site_id: site?.id === "demo" ? null : site?.id,
          title: c.title,
          kind: "pr",
          repo: `${owner}/${repo}`,
          pr_number: c.prNumber,
          detail: `Agent branch ${c.branch} — review the diff on GitHub, then approve to merge & deploy.`,
          status: "pending",
        });
        if (site && site.id !== "demo") {
          await logActivity(site.id, "agent", `Opened PR #${c.prNumber}: ${c.title}`);
        }
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
