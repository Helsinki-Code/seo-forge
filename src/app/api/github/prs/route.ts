import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listOpenPRs, siteRepo } from "@/lib/github";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const prs = await listOpenPRs();
    return NextResponse.json({ repo: siteRepo(), prs });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "github error";
    return NextResponse.json({ repo: siteRepo(), prs: [], error: msg }, { status: 200 });
  }
}
