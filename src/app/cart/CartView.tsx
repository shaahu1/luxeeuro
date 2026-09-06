"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatLkr } from "@/data/products";
import { getUserDisplayName } from "@/lib/user";
import { createOrderFromCart } from "@/lib/orders";
import { orderCartUrl } from "@/lib/whatsapp";
import { ProductImage } from "@/components/ProductImage";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function CartView() {
  const { user } = useAuth();
  const { items, subtotal, ready, setQuantity, removeItem, count, clearCart } =
    useCart();
  const [origin, setOrigin] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function placeOrder() {
    if (!items.length || placing) return;

    const email = (user?.email || guestEmail).trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      setError("Enter a valid email so we can send your order confirmation.");
      return;
    }

    setError(null);
    setEmailNote(null);
    setPlacing(true);

    const cartSnapshot = items.map((item) => ({ ...item }));
    const { order, error: orderError } = await createOrderFromCart({
      items: cartSnapshot,
      user,
      customerEmail: email,
    });

    if (orderError || !order) {
      setPlacing(false);
      setError(orderError ?? "Could not create order.");
      return;
    }

    try {
      const emailRes = await fetch("/api/orders/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          orderNumber: order.orderNumber,
          customerName: user ? getUserDisplayName(user) : null,
          totalLkr: order.totalLkr,
          items: cartSnapshot.map((item) => ({
            brand: item.product.brand,
            name: item.product.name,
            quantity: item.quantity,
            unitPriceLkr: item.product.priceLkr,
            lineTotalLkr: item.product.priceLkr * item.quantity,
          })),
        }),
      });
      const emailJson = (await emailRes.json().catch(() => ({}))) as {
        sent?: boolean;
        configured?: boolean;
        error?: string;
      };
      if (emailJson.sent) {
        setEmailNote(`Confirmation email sent to ${email}.`);
      } else if (emailJson.configured === false) {
        setEmailNote(
          "Order saved. Add RESEND_API_KEY in .env.local to enable confirmation emails.",
        );
      } else {
        setEmailNote(
          emailJson.error ||
            "Order saved, but the confirmation email could not be sent.",
        );
      }
    } catch {
      setEmailNote(
        "Order saved, but the confirmation email could not be sent.",
      );
    }

    const waUrl = orderCartUrl(
      cartSnapshot,
      origin || window.location.origin,
      order.orderNumber,
    );

    setLastOrderNumber(order.orderNumber);
    clearCart();
    setPlacing(false);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

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
        {lastOrderNumber ? (
          <div className="mt-2 space-y-1 text-teal-deep">
            <p>
              Order <span className="font-semibold">{lastOrderNumber}</span> was
              created. Continue in WhatsApp if it opened.
            </p>
            {emailNote && <p className="text-sm">{emailNote}</p>}
          </div>
        ) : (
          <p className="mt-2 text-ink-muted">
            Add products from the catalogue, then place your order here.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {lastOrderNumber && user && (
            <Link
              href="/orders"
              className="inline-flex rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-deep"
            >
              View my orders
            </Link>
          )}
          <Link
            href="/products"
            className="inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-teal"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

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
              <ProductImage
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
                    disabled={item.quantity >= (item.product.quantity ?? 0)}
                    className="cursor-pointer px-3 py-1.5 text-sm font-semibold text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() =>
                      setQuantity(item.slug, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-ink-muted">
                  {(item.product.quantity ?? 0) <= 0
                    ? "Out of stock"
                    : `${item.product.quantity} available`}
                </p>
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

        {!user?.email && (
          <label className="mt-5 block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Email for confirmation
            </span>
            <input
              type="email"
              autoComplete="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="you@email.com"
              className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal"
            />
          </label>
        )}

        {user?.email && (
          <p className="mt-4 text-xs text-ink-muted">
            Confirmation email will go to{" "}
            <span className="font-semibold text-ink">{user.email}</span>.
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void placeOrder()}
          disabled={placing || !origin}
          className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-md bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {placing ? "Placing order…" : "Place Order"}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Creates your order, emails a confirmation, then opens WhatsApp with
          the order details.
        </p>
      </aside>
    </div>
  );
}
