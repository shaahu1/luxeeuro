"use client";

import Link from "next/link";
import {
  type Product,
  discountPercent,
  formatLkr,
} from "@/data/products";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImage } from "@/components/ProductImage";

type Props = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority }: Props) {
  const off = discountPercent(product);
  const outOfStock = (product.quantity ?? 0) <= 0;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-mist"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
          className={`object-cover transition duration-500 group-hover:scale-[1.04] ${outOfStock ? "opacity-70" : ""}`}
          priority={priority}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
          {outOfStock ? (
            <span className="bg-red-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
              Out of Stock
            </span>
          ) : (
            <span />
          )}
          {product.isNew && !outOfStock && (
            <span className="ml-auto bg-teal px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
              New
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2">
          <span className="bg-ink/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
            −{off}%
          </span>
        </div>
      </Link>

      <div className="mt-2 flex flex-1 flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
          {product.brand}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="mt-0.5 line-clamp-2 font-display text-sm font-semibold leading-snug text-ink transition group-hover:text-teal-deep"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div>
            <p className="font-display text-sm font-bold text-ink">
              {formatLkr(product.priceLkr)}
            </p>
            <p className="text-[10px] text-ink-muted line-through">
              {formatLkr(product.marketPriceLkr)}
            </p>
          </div>
          <AddToCartButton
            slug={product.slug}
            maxQuantity={product.quantity ?? 0}
            label="Add"
            className="shrink-0 cursor-pointer rounded-md bg-teal px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-teal-deep"
          />
        </div>
      </div>
    </article>
  );
}
