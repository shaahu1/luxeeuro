/** Supports classic anon JWT keys and newer sb_publishable_ keys. */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  const configured =
    Boolean(url && key) &&
    !url.includes("YOUR_PROJECT") &&
    key !== "YOUR_ANON_KEY";

  return { url, key, configured };
}
