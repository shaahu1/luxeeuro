"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { generalOrderUrl } from "@/lib/whatsapp";

export function HomeProductSections() {
  const { featured, newArrivals } = useProducts();

  return (
    <>
      <section className="bg-mist/70 py-20">
        <div className="mx-auto w-full px-5 sm:px-8 lg:px-[200px]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
                Bestsellers
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                What people order
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-teal hover:text-teal-deep"
            >
              View all →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {featured.slice(0, 5).map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full px-5 py-20 sm:px-8 lg:px-[200px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              Just in
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">
              New arrivals
            </h2>
          </div>
          <Link
            href="/products?new=1"
            className="text-sm font-semibold text-teal hover:text-teal-deep"
          >
            View all →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {newArrivals.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-teal/30 blur-3xl" />
        <div className="relative mx-auto flex w-full flex-col px-5 sm:px-8 lg:px-[200px] md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to order?
            </h2>
            <p className="mt-3 text-white/65">
              Browse the catalogue, then message us on WhatsApp with the item
              you want. Fast replies, personal sourcing.
            </p>
          </div>
          <a
            href={generalOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex cursor-pointer rounded-md bg-teal px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-deep md:mt-0"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
