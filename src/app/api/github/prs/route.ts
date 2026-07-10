import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listOpenPRs, siteRepoOf } from "@/lib/github";
import { getUserSite } from "@/lib/data";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { site } = await getUserSite(userId);
  if (!site || site.platform === "wordpress") {
    return NextResponse.json({ repo: null, prs: [] });
  }
  try {
    const prs = await listOpenPRs(site);
    return NextResponse.json({ repo: siteRepoOf(site), prs });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "github error";
    return NextResponse.json({ repo: null, prs: [], error: msg }, { status: 200 });
  }
}
