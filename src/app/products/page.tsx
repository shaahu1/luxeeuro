import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductCatalog } from "@/components/ProductCatalog";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse authentic Italian and European brands available for delivery to Sri Lanka. Order via WhatsApp.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
          Catalogue
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          All products
        </h1>
        <p className="mt-4 text-ink-muted">
          Every item sourced from Italy and Europe. Genuine brands, transparent
          pricing — up to 55% below Sri Lankan market rates.
        </p>
      </div>

      <div className="mt-10">
        <Suspense
          fallback={
            <p className="text-sm text-ink-muted">Loading catalogue…</p>
          }
        >
          <ProductCatalog />
        </Suspense>
      </div>
    </div>
  );
}
