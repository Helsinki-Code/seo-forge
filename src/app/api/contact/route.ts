import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  website: z.string().url().max(500),
  sites: z.enum(["1", "2–5", "6–25", "26+"]),
  objective: z.string().min(1).max(160),
  message: z.string().max(2500).optional().default(""),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill all fields correctly." }, { status: 400 });
  }
  try {
    // Keep compatibility with the deployed contact_messages table while retaining
    // qualification context in a human-readable, auditable message field.
    const { name, email, website, sites, objective, message } = parsed.data;
    const qualifiedMessage = [`Website: ${website}`, `Number of websites: ${sites}`, `Primary objective: ${objective}`, message ? `Notes: ${message}` : null].filter(Boolean).join("\n");
    const { error } = await supabase().from("contact_messages").insert({ name, email, message: qualifiedMessage });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Message couldn't be stored right now — please email us directly." },
      { status: 503 },
    );
  }
}
