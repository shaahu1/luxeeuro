"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  slug: string;
  maxQuantity: number;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  slug,
  maxQuantity,
  className,
  label = "Add to cart",
}: Props) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((item) => item.slug === slug)?.quantity ?? 0;
  const outOfStock = maxQuantity <= 0;
  const atMax = inCart >= maxQuantity;

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        className={`${className ?? ""} cursor-not-allowed opacity-50`}
      >
        Out of stock
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={atMax}
      className={`${className ?? ""} ${atMax ? "cursor-not-allowed opacity-60" : ""}`}
      onClick={() => {
        const ok = addItem(slug);
        if (!ok) return;
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? "Added" : atMax ? "Max in cart" : label}
    </button>
  );
}
