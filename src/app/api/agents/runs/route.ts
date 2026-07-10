import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRuns, getUserSite } from "@/lib/data";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { site, demo } = await getUserSite(userId);
  if (!site) return NextResponse.json({ runs: [], demo });
  const { data } = await getRuns(site.id, 30);
  return NextResponse.json({ runs: data, demo });
}
