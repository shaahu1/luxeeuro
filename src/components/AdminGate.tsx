"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { isAdminEmail } from "@/lib/admin";

const tabs = [
  { href: "/admin", label: "Products", match: (path: string) => path === "/admin" },
  {
    href: "/admin/orders",
    label: "Orders",
    match: (path: string) => path.startsWith("/admin/orders"),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`cursor-pointer rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
              active
                ? "bg-ink text-white"
                : "border border-line bg-white text-ink-muted hover:border-teal hover:text-teal"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, ready: authReady, configured, signInWithGoogle } = useAuth();
  const admin = isAdminEmail(user?.email);

  if (!authReady) {
    return <p className="mt-10 text-sm text-ink-muted">Checking session…</p>;
  }

  if (!configured) {
    return (
      <div className="mt-8 rounded-md border border-line bg-mist/60 p-5 text-sm text-ink-muted">
        Configure Supabase in <code className="text-ink">.env.local</code> first.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-10 space-y-4">
        <p className="text-ink-muted">
          Sign in with Google using your admin email to manage the store.
        </p>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="cursor-pointer rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-deep"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="mt-10 space-y-3 rounded-md border border-line bg-mist/60 p-5">
        <p className="font-semibold text-ink">Access denied</p>
        <p className="text-sm text-ink-muted">
          Signed in as <span className="text-ink">{user.email}</span>, but this
          email is not in{" "}
          <code className="text-ink">NEXT_PUBLIC_ADMIN_EMAILS</code>.
        </p>
        <pre className="overflow-x-auto rounded-md bg-ink px-4 py-3 text-xs text-glow">
          NEXT_PUBLIC_ADMIN_EMAILS={user.email}
        </pre>
      </div>
    );
  }

  return <>{children}</>;
}
