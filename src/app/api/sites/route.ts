import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { encryptSecret } from "@/lib/crypto";
import { getUserSite } from "@/lib/data";
import { verifyWordPress } from "@/lib/wordpress";
import type { Site } from "@/lib/data";

const Body = z
  .object({
    name: z.string().min(1).max(120),
    url: z.string().url().max(300),
    platform: z.enum(["github", "wordpress"]),
    githubRepo: z
      .string()
      .regex(/^[\w.-]+\/[\w.-]+$/, "Use owner/repo format")
      .optional(),
    githubToken: z.string().max(400).optional(),
    wpUsername: z.string().max(200).optional(),
    wpAppPassword: z.string().max(400).optional(),
  })
  .refine((b) => (b.platform === "github" ? !!b.githubRepo : true), {
    message: "GitHub sites need a repository (owner/repo)",
  })
  .refine((b) => (b.platform === "wordpress" ? !!b.wpUsername && !!b.wpAppPassword : true), {
    message: "WordPress sites need a username and application password",
  });

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { site, demo } = await getUserSite(userId);
  if (site) {
    // never return encrypted secrets to the client
    const { repo_token_enc, wp_app_password_enc, ...safe } = site;
    return NextResponse.json({
      site: {
        ...safe,
        hasGithubToken: !!repo_token_enc,
        hasWpPassword: !!wp_app_password_enc,
      },
      demo,
    });
  }
  return NextResponse.json({ site: null, demo });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid input" },
      { status: 400 },
    );
  }
  const b = parsed.data;

  const row: Record<string, unknown> = {
    user_id: userId,
    name: b.name,
    url: b.url,
    platform: b.platform,
    github_repo: b.platform === "github" ? b.githubRepo : null,
    wp_username: b.platform === "wordpress" ? b.wpUsername : null,
  };
  if (b.githubToken) row.repo_token_enc = encryptSecret(b.githubToken);
  if (b.wpAppPassword) row.wp_app_password_enc = encryptSecret(b.wpAppPassword);

  try {
    const { site: existing } = await getUserSite(userId);
    let saved: Site;
    if (existing && existing.id !== "demo") {
      const { data, error } = await supabase()
        .from("sites")
        .update(row)
        .eq("id", existing.id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      saved = data as Site;
    } else {
      const { data, error } = await supabase().from("sites").insert(row).select().single();
      if (error) throw error;
      saved = data as Site;
    }

    // Verify WordPress credentials right away so users get instant feedback
    let verified: boolean | null = null;
    if (b.platform === "wordpress" && b.wpAppPassword) {
      try {
        verified = await verifyWordPress(saved);
      } catch {
        verified = false;
      }
    }

    return NextResponse.json({ ok: true, siteId: saved.id, wpVerified: verified });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db error";
    return NextResponse.json(
      { error: `Couldn't save site (${msg}). Have you run supabase/schema-v2.sql?` },
      { status: 503 },
    );
  }
}
