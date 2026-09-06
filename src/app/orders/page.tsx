import type { Metadata } from "next";
import { MyOrdersPanel } from "@/components/MyOrdersPanel";

export const metadata: Metadata = {
  title: "My orders",
  description: "View your LuXe Euro orders.",
};

export default function OrdersPage() {
  return (
    <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        Account
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        My orders
      </h1>
      <p className="mt-3 text-ink-muted">
        Track orders you placed while signed in.
      </p>
      <MyOrdersPanel />
    </div>
  );
}
