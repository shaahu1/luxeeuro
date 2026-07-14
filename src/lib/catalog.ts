import {
  type Category,
  type Product,
  seedProducts,
} from "@/data/products";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  price_lkr: number;
  market_price_lkr: number;
  image: string;
  is_new: boolean;
  featured: boolean;
  origin: string;
};

const validCategories = new Set<Category>([
  "fashion",
  "bags",
  "watches",
  "perfumes",
  "shoes",
  "accessories",
  "electronics",
]);

export function mapProductRow(row: ProductRow): Product {
  const category = validCategories.has(row.category as Category)
    ? (row.category as Category)
    : "accessories";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    description: row.description,
    category,
    priceLkr: row.price_lkr,
    marketPriceLkr: row.market_price_lkr,
    image: row.image,
    isNew: row.is_new,
    featured: row.featured,
    origin: row.origin,
  };
}

export function toProductInsert(product: Omit<Product, "id">) {
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    category: product.category,
    price_lkr: product.priceLkr,
    market_price_lkr: product.marketPriceLkr,
    image: product.image,
    is_new: Boolean(product.isNew),
    featured: Boolean(product.featured),
    origin: product.origin,
  };
}

export async function fetchProducts(): Promise<{
  products: Product[];
  source: "supabase" | "seed";
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { products: seedProducts, source: "seed", error: null };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        products: seedProducts,
        source: "seed",
        error: error.message,
      };
    }

    if (!data?.length) {
      return { products: [], source: "supabase", error: null };
    }

    return {
      products: (data as ProductRow[]).map(mapProductRow),
      source: "supabase",
      error: null,
    };
  } catch (e) {
    return {
      products: seedProducts,
      source: "seed",
      error: e instanceof Error ? e.message : "Failed to load products",
    };
  }
}
