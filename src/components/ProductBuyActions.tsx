"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/data/products";

export function ProductBuyActions({ product }: { product: Product }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <AddToCartButton
        slug={product.slug}
        className="inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-deep sm:w-auto"
      />
      <Link
        href="/cart"
        className="inline-flex w-full items-center justify-center rounded-md border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal sm:w-auto"
      >
        View cart
      </Link>
      <p className="text-xs text-ink-muted sm:basis-full">
        Add items to your cart, then place the full order on WhatsApp from the
        cart page (includes product links).
      </p>
    </div>
  );
}
