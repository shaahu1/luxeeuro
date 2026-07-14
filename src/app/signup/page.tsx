import type { Metadata } from "next";
import { GoogleAuthForm } from "@/components/GoogleAuthForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a LuXe Euro account with Google.",
};

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-5 pb-20 pt-28 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        Account
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        Create account
      </h1>
      <p className="mt-3 text-ink-muted">
        Enter your email (optional), then authenticate with Google to join LuXe
        Euro.
      </p>
      <GoogleAuthForm mode="signup" />
    </div>
  );
}
