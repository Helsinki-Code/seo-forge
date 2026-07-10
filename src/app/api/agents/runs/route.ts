import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRuns } from "@/lib/data";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, demo } = await getRuns(30);
  return NextResponse.json({ runs: data, demo });
}
