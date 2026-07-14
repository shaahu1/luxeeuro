"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "signup";

export function GoogleAuthForm({ mode }: { mode: Mode }) {
  const { signInWithGoogle, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onGoogle(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signInWithGoogle(email.trim() || undefined);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success the browser redirects to Google, then /auth/callback
  }

  if (!configured) {
    return (
      <div className="mt-8 rounded-md border border-line bg-mist/60 p-5 text-sm text-ink-muted">
        Auth is not configured yet. Add{" "}
        <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-ink">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
        <code className="text-ink">.env.local</code>, enable Google in Supabase,
        then restart the dev server.
      </div>
    );
  }

  return (
    <form onSubmit={onGoogle} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Email
        </span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
          placeholder="you@gmail.com"
        />
        <span className="mt-2 block text-xs text-ink-muted">
          Optional — helps Google pre-select that account.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold text-teal hover:text-teal-deep"
            >
              Create account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal hover:text-teal-deep"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.7-4.6 6.4-8.3 7.2l6.3 5.3C36.9 38 44 32.5 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
