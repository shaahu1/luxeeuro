"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getProductBySlug, type Product } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";

export type CartLine = {
  slug: string;
  quantity: number;
};

export type CartItem = CartLine & {
  product: Product;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (slug: string, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
};

const LEGACY_KEY = "luxeeuro-cart";
const GUEST_KEY = "luxeeuro-cart:guest";

const CartContext = createContext<CartContextValue | null>(null);

function userKey(userId: string) {
  return `luxeeuro-cart:user:${userId}`;
}

function storageKeyFor(owner: string) {
  return owner === "guest" ? GUEST_KEY : userKey(owner);
}

function parseLines(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) =>
        typeof line?.slug === "string" &&
        typeof line?.quantity === "number" &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

function readStorage(owner: string): CartLine[] {
  if (typeof window === "undefined") return [];

  if (owner === "guest") {
    const guest = parseLines(localStorage.getItem(GUEST_KEY));
    const legacy = parseLines(localStorage.getItem(LEGACY_KEY));
    if (legacy.length && !guest.length) {
      localStorage.setItem(GUEST_KEY, JSON.stringify(legacy));
      localStorage.removeItem(LEGACY_KEY);
      return legacy;
    }
    return guest;
  }

  return parseLines(localStorage.getItem(userKey(owner)));
}

function writeStorage(owner: string, lines: CartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKeyFor(owner), JSON.stringify(lines));
}

function mergeLines(a: CartLine[], b: CartLine[]): CartLine[] {
  const qty = new Map<string, number>();
  for (const line of [...a, ...b]) {
    qty.set(line.slug, (qty.get(line.slug) ?? 0) + line.quantity);
  }
  return Array.from(qty.entries()).map(([slug, quantity]) => ({
    slug,
    quantity,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const { products, ready: catalogReady } = useProducts();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const owner = authReady && catalogReady ? (user?.id ?? "guest") : null;
  const previousOwner = useRef<string | null>(null);
  const linesRef = useRef(lines);
  const skipNextWrite = useRef(false);

  linesRef.current = lines;

  useEffect(() => {
    if (!owner) return;

    const prev = previousOwner.current;

    if (prev === null) {
      skipNextWrite.current = true;
      setLines(readStorage(owner));
    } else if (prev !== owner) {
      writeStorage(prev, linesRef.current);

      if (prev === "guest" && owner !== "guest") {
        const guestCart = readStorage("guest");
        const userCart = readStorage(owner);
        const merged = mergeLines(guestCart, userCart);
        skipNextWrite.current = true;
        setLines(merged);
        writeStorage(owner, merged);
        writeStorage("guest", []);
      } else {
        skipNextWrite.current = true;
        setLines(readStorage(owner));
      }
    }

    previousOwner.current = owner;
    setReady(true);
  }, [owner]);

  useEffect(() => {
    if (!ready || !owner) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    writeStorage(owner, lines);
  }, [lines, ready, owner]);

  const addItem = useCallback(
    (slug: string, quantity = 1) => {
      if (!getProductBySlug(slug, products)) return;
      setLines((prev) => {
        const existing = prev.find((l) => l.slug === slug);
        if (existing) {
          return prev.map((l) =>
            l.slug === slug
              ? { ...l, quantity: l.quantity + quantity }
              : l,
          );
        }
        return [...prev, { slug, quantity }];
      });
    },
    [products],
  );

  const removeItem = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.slug !== slug));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.slug === slug ? { ...l, quantity } : l)),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const items = useMemo(() => {
    return lines
      .map((line) => {
        const product = getProductBySlug(line.slug, products);
        if (!product) return null;
        return { ...line, product };
      })
      .filter((item): item is CartItem => item !== null);
  }, [lines, products]);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.priceLkr * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      ready,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    }),
    [items, count, subtotal, ready, addItem, removeItem, setQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
