import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = {
  title: "Cart",
  description:
    "Review your LuXe Euro cart and place your order on WhatsApp.",
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        Cart
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Your cart
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        Adjust quantities, then place your order on WhatsApp. Your message will
        include product links and totals.
      </p>
      <CartView />
    </div>
  );
}
