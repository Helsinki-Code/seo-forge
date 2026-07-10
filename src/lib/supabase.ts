import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Server-side Supabase client. Uses the secret (service role) key when
 * provided, otherwise falls back to the publishable key — fine while all
 * tables are app-layer protected (see supabase/schema.sql notes).
 */
export function supabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
