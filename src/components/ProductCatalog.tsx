"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  categories,
  type Category,
} from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { requestProductUrl } from "@/lib/whatsapp";
import { useProducts } from "@/context/ProductsContext";

export function ProductCatalog() {
  const { products } = useProducts();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as Category | "all" | null;
  const onlyNew = searchParams.get("new") === "1";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  useEffect(() => {
    if (categoryParam && categories.some((c) => c.id === categoryParam)) {
      setCategory(categoryParam);
    } else if (!categoryParam) {
      setCategory("all");
    }
  }, [categoryParam]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (onlyNew && !p.isNew) return false;
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [category, onlyNew, query, products]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {categories.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`cursor-pointer rounded-md px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition ${
                  active
                    ? "bg-ink text-white"
                    : "border border-line bg-white text-ink-muted hover:border-ink hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 lg:justify-end">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted whitespace-nowrap">
            {filtered.length} items
            {onlyNew ? " · new arrivals" : ""}
          </p>
          <label className="relative block w-full sm:w-72 lg:w-80">
            <span className="sr-only">Search products</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or brands…"
              className="w-full rounded-md border border-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal"
            />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-display text-2xl font-semibold text-ink">
            No matches
          </p>
          <p className="mt-2 text-ink-muted">
            Try another search, or ask us to source it.
          </p>
          <a
            href={requestProductUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-deep"
          >
            Request on WhatsApp
          </a>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i < 5}
            />
          ))}
        </div>
      )}

      <div className="mt-20 border-t border-line pt-12 text-center">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Looking for something else?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          We can source most Italian and European brands. Tell us what you need.
        </p>
        <a
          href={requestProductUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal"
        >
          Request a product
        </a>
      </div>
    </div>
  );
}
