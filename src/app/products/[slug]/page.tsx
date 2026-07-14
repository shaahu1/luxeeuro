"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductBuyActions } from "@/components/ProductBuyActions";
import { useProducts } from "@/context/ProductsContext";
import { discountPercent, formatLkr } from "@/data/products";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { getBySlug, ready } = useProducts();
  const product = getBySlug(slug);

  if (!ready) {
    return (
      <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
        <p className="text-sm text-ink-muted">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
        <p className="font-display text-2xl font-semibold text-ink">
          Product not found
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm font-semibold text-teal"
        >
          ← Back to products
        </Link>
      </div>
    );
  }

  const off = discountPercent(product);

  return (
    <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
      <Link
        href="/products"
        className="text-sm font-semibold text-teal hover:text-teal-deep"
      >
        ← Back to products
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={!product.image.includes("images.unsplash.com")}
          />
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 leading-relaxed text-ink-muted">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-4">
            <div>
              <p className="font-display text-3xl font-bold text-ink">
                {formatLkr(product.priceLkr)}
              </p>
              <p className="text-sm text-ink-muted line-through">
                Market {formatLkr(product.marketPriceLkr)}
              </p>
            </div>
            <span className="rounded-md bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-deep">
              Save {off}%
            </span>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-6 text-sm">
            <div>
              <dt className="text-ink-muted">Origin</dt>
              <dd className="mt-1 font-semibold text-ink">{product.origin}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Category</dt>
              <dd className="mt-1 font-semibold capitalize text-ink">
                {product.category}
              </dd>
            </div>
          </dl>

          <ProductBuyActions product={product} />
        </div>
      </div>
    </div>
  );
}
