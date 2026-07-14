"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  slug: string;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  slug,
  className,
  label = "Add to cart",
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(slug);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? "Added" : label}
    </button>
  );
}
