import type { User } from "@supabase/supabase-js";

export function getUserDisplayName(user: User) {
  const meta = user.user_metadata ?? {};

  if (typeof meta.given_name === "string" && meta.given_name.trim()) {
    return meta.given_name.trim();
  }

  const full =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";

  const first = full.trim().split(/\s+/)[0];
  if (first) return first;

  const email = user.email ?? "";
  const local = email.split("@")[0];
  return local || "Account";
}
