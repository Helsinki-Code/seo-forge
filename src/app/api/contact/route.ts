import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(10).max(4000),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill all fields correctly." }, { status: 400 });
  }
  try {
    const { error } = await supabase().from("contact_messages").insert(parsed.data);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Message couldn't be stored right now — please email us directly." },
      { status: 503 },
    );
  }
}
