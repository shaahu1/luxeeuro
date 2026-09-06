"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/data/products";

export function ProductBuyActions({ product }: { product: Product }) {
  const stock = product.quantity ?? 0;
  const outOfStock = stock <= 0;

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {outOfStock ? (
        <span className="inline-flex w-fit rounded-md bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
          Out of Stock
        </span>
      ) : (
        <p className="text-sm text-ink-muted sm:basis-full">
          {stock} in stock
        </p>
      )}
      <AddToCartButton
        slug={product.slug}
        maxQuantity={stock}
        className="inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-deep sm:w-auto"
      />
      <Link
        href="/cart"
        className="inline-flex w-full items-center justify-center rounded-md border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal sm:w-auto"
      >
        View cart
      </Link>
      <p className="text-xs text-ink-muted sm:basis-full">
        You can order up to the available quantity. Place your order from the
        cart page.
      </p>
    </div>
  );
}
