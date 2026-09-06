export type Category =
  | "fashion"
  | "bags"
  | "watches"
  | "perfumes"
  | "shoes"
  | "accessories"
  | "electronics";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  category: Category;
  priceLkr: number;
  marketPriceLkr: number;
  image: string;
  isNew?: boolean;
  featured?: boolean;
  origin: string;
  quantity: number;
};

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fashion", label: "Fashion" },
  { id: "bags", label: "Bags & Leather" },
  { id: "watches", label: "Watches" },
  { id: "perfumes", label: "Perfumes" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
  { id: "electronics", label: "Electronics" },
];

export const seedProducts: Product[] = [
  {
    id: "1",
    slug: "armani-classic-polo",
    name: "Armani Classic Polo Shirt",
    brand: "Giorgio Armani",
    description:
      "Premium cotton polo from Giorgio Armani’s classic collection. Sourced directly from Italy.",
    category: "fashion",
    priceLkr: 42000,
    marketPriceLkr: 85000,
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    isNew: true,
    featured: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "2",
    slug: "versace-medusa-tee",
    name: "Versace Medusa T-Shirt",
    brand: "Versace",
    description:
      "Iconic Medusa logo tee in premium cotton. Authentic Italian luxury.",
    category: "fashion",
    priceLkr: 38000,
    marketPriceLkr: 72000,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    isNew: true,
    featured: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "3",
    slug: "dg-silk-shirt",
    name: "Dolce & Gabbana Silk Shirt",
    brand: "Dolce & Gabbana",
    description:
      "Luxurious silk shirt with signature D&G print. Authentic, sourced from Italy.",
    category: "fashion",
    priceLkr: 95000,
    marketPriceLkr: 180000,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "4",
    slug: "gucci-gg-marmont",
    name: "Gucci GG Marmont Bag",
    brand: "Gucci",
    description:
      "Iconic GG Marmont shoulder bag in matelassé leather with double G hardware.",
    category: "bags",
    priceLkr: 285000,
    marketPriceLkr: 520000,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    featured: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "5",
    slug: "prada-saffiano-tote",
    name: "Prada Saffiano Tote",
    brand: "Prada",
    description:
      "Classic Prada Saffiano leather tote. Timeless elegance from Milan.",
    category: "bags",
    priceLkr: 310000,
    marketPriceLkr: 580000,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a67478a?auto=format&fit=crop&w=800&q=80",
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "6",
    slug: "fendi-baguette",
    name: "Fendi Baguette Bag",
    brand: "Fendi",
    description:
      "The legendary Fendi Baguette in premium leather with FF logo hardware.",
    category: "bags",
    priceLkr: 265000,
    marketPriceLkr: 490000,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    isNew: true,
    featured: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "7",
    slug: "emporio-armani-chrono",
    name: "Emporio Armani Chronograph",
    brand: "Emporio Armani",
    description:
      "Sophisticated chronograph with stainless steel bracelet.",
    category: "watches",
    priceLkr: 78000,
    marketPriceLkr: 145000,
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    featured: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "8",
    slug: "versace-v-race",
    name: "Versace V-Race Watch",
    brand: "Versace",
    description:
      "Bold V-Race watch with iconic Medusa dial and leather strap.",
    category: "watches",
    priceLkr: 92000,
    marketPriceLkr: 175000,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "9",
    slug: "bulgari-serpenti",
    name: "Bulgari Serpenti Watch",
    brand: "Bulgari",
    description:
      "Elegant Serpenti watch — a symbol of Italian craftsmanship.",
    category: "watches",
    priceLkr: 420000,
    marketPriceLkr: 780000,
    image:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80",
    isNew: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "10",
    slug: "acqua-di-gio-edp",
    name: "Acqua di Gio EDP",
    brand: "Giorgio Armani",
    description:
      "The iconic Acqua di Gio Eau de Parfum — fresh, aquatic, timeless. 100ml.",
    category: "perfumes",
    priceLkr: 28000,
    marketPriceLkr: 52000,
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    featured: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "11",
    slug: "versace-eros-edp",
    name: "Versace Eros EDP 100ml",
    brand: "Versace",
    description:
      "Versace Eros — a bold, seductive fragrance for the modern man. 100ml.",
    category: "perfumes",
    priceLkr: 26500,
    marketPriceLkr: 48000,
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80",
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "12",
    slug: "nike-air-max-italy",
    name: "Nike Air Max (Italy Edition)",
    brand: "Nike",
    description:
      "Authentic Nike Air Max sourced from Italy. Premium comfort and style.",
    category: "shoes",
    priceLkr: 45000,
    marketPriceLkr: 78000,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "13",
    slug: "adidas-ultraboost-23",
    name: "Adidas Ultraboost 23",
    brand: "Adidas",
    description:
      "European edition Ultraboost 23 with superior cushioning.",
    category: "shoes",
    priceLkr: 48000,
    marketPriceLkr: 82000,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
    isNew: true,
    featured: true,
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "14",
    slug: "gucci-gg-belt",
    name: "Gucci GG Belt",
    brand: "Gucci",
    description:
      "Authentic GG Supreme canvas belt with gold-tone buckle.",
    category: "accessories",
    priceLkr: 68000,
    marketPriceLkr: 125000,
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583fd?auto=format&fit=crop&w=800&q=80",
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "15",
    slug: "versace-medusa-sunglasses",
    name: "Versace Medusa Sunglasses",
    brand: "Versace",
    description:
      "Bold Medusa logo sunglasses with UV400 protection. Italian design.",
    category: "accessories",
    priceLkr: 72000,
    marketPriceLkr: 135000,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    origin: "Italy",
    quantity: 10,
  },
  {
    id: "16",
    slug: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5 Headphones",
    brand: "Sony",
    description:
      "Industry-leading noise cancelling. European model, sealed box.",
    category: "electronics",
    priceLkr: 98000,
    marketPriceLkr: 165000,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    featured: true,
    origin: "Europe",
    quantity: 10,
  },
  {
    id: "17",
    slug: "dyson-airwrap-complete",
    name: "Dyson Airwrap Complete",
    brand: "Dyson",
    description:
      "Iconic Airwrap Complete styler. European model with adapter.",
    category: "electronics",
    priceLkr: 145000,
    marketPriceLkr: 245000,
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80",
    isNew: true,
    origin: "Europe",
    quantity: 10,
  },
];

export function formatLkr(amount: number) {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `LKR ${formatted}`;
}

export function discountPercent(product: Product) {
  return Math.round(
    ((product.marketPriceLkr - product.priceLkr) / product.marketPriceLkr) * 100,
  );
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** @deprecated Prefer useProducts() — kept for cart hydration fallback */
export const products = seedProducts;

export function getProductBySlug(slug: string, list: Product[] = seedProducts) {
  return list.find((p) => p.slug === slug);
}

export function getFeaturedProducts(list: Product[] = seedProducts) {
  return list.filter((p) => p.featured);
}

export function getNewArrivals(list: Product[] = seedProducts) {
  return list.filter((p) => p.isNew);
}
