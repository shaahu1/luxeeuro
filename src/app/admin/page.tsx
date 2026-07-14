import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage LuXe Euro products.",
};

export default function AdminPage() {
  return (
    <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        Admin
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        Products
      </h1>
      <p className="mt-3 text-ink-muted">
        Sign in with your admin Google account to add and manage catalogue
        items.
      </p>
      <AdminPanel />
    </div>
  );
}
