import type { Metadata } from "next";
import { AdminGate, AdminNav } from "@/components/AdminGate";
import { AdminOrdersPanel } from "@/components/AdminOrdersPanel";

export const metadata: Metadata = {
  title: "Orders",
  description: "View LuXe Euro customer orders.",
};

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        Admin
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        Orders
      </h1>
      <p className="mt-3 text-ink-muted">
        All customer orders from WhatsApp checkout (signed-in and guest).
      </p>
      <AdminGate>
        <AdminNav />
        <AdminOrdersPanel />
      </AdminGate>
    </div>
  );
}
