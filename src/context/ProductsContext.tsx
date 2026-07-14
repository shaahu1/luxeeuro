"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getFeaturedProducts,
  getNewArrivals,
  getProductBySlug,
  seedProducts,
  type Product,
} from "@/data/products";
import { fetchProducts } from "@/lib/catalog";

type ProductsContextValue = {
  products: Product[];
  ready: boolean;
  source: "supabase" | "seed";
  error: string | null;
  refresh: () => Promise<void>;
  getBySlug: (slug: string) => Product | undefined;
  featured: Product[];
  newArrivals: Product[];
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<"supabase" | "seed">("seed");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await fetchProducts();
    setProducts(result.products);
    setSource(result.source);
    setError(result.error);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      products,
      ready,
      source,
      error,
      refresh,
      getBySlug: (slug: string) => getProductBySlug(slug, products),
      featured: getFeaturedProducts(products),
      newArrivals: getNewArrivals(products),
    }),
    [products, ready, source, error, refresh],
  );

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return ctx;
}
