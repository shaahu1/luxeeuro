"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatLkr } from "@/data/products";
import { orderCartUrl } from "@/lib/whatsapp";

export function CartView() {
  const { items, subtotal, ready, setQuantity, removeItem, count } = useCart();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!ready) {
    return (
      <p className="mt-10 text-sm text-ink-muted">Loading your cart…</p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">
          Your cart is empty
        </p>
        <p className="mt-2 text-ink-muted">
          Add products from the catalogue, then place your order here.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-teal"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const checkoutHref = origin ? orderCartUrl(items, origin) : "#";

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li
            key={item.slug}
            className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative h-28 w-24 shrink-0 overflow-hidden bg-mist sm:h-32 sm:w-28"
            >
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal">
                {item.product.brand}
              </p>
              <Link
                href={`/products/${item.slug}`}
                className="font-display text-lg font-semibold text-ink hover:text-teal-deep"
              >
                {item.product.name}
              </Link>
              <p className="mt-1 text-sm text-ink-muted">
                {formatLkr(item.product.priceLkr)} each
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center border border-line">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="cursor-pointer px-3 py-1.5 text-sm font-semibold text-ink hover:bg-mist"
                    onClick={() =>
                      setQuantity(item.slug, item.quantity - 1)
                    }
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="cursor-pointer px-3 py-1.5 text-sm font-semibold text-ink hover:bg-mist"
                    onClick={() =>
                      setQuantity(item.slug, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.slug)}
                  className="cursor-pointer text-xs font-semibold uppercase tracking-[0.1em] text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>

            <p className="font-display text-lg font-bold text-ink sm:text-right">
              {formatLkr(item.product.priceLkr * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-line bg-white p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-bold text-ink">
          Order summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-ink-muted">
            <dt>Items</dt>
            <dd>{count}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 font-display text-lg font-bold text-ink">
            <dt>Total</dt>
            <dd>{formatLkr(subtotal)}</dd>
          </div>
        </dl>

        <a
          href={checkoutHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-md bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-deep"
        >
          Place order on WhatsApp
        </a>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Opens WhatsApp with your cart items, totals, and product links
          pre-filled. No online payment — we confirm details in chat.
        </p>
      </aside>
    </div>
  );
}
