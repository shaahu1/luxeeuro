import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured;
}

export function createClient() {
  const { url, key, configured } = getSupabaseEnv();

  if (!configured) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or publishable/anon key in .env.local",
    );
  }

  return createBrowserClient(url, key);
}
