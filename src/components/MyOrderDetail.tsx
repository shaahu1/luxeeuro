"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatLkr } from "@/data/products";
import {
  fetchOrderDetail,
  type OrderDetail,
} from "@/lib/orders";
import { OrderStatusChip } from "@/components/OrderStatusChip";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export function MyOrderDetail({ orderId }: { orderId: string }) {
  const { user, ready: authReady, configured, signInWithGoogle } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await fetchOrderDetail(orderId, { userId: user.id });
    setOrder(result.order);
    setError(result.error);
    setLoading(false);
  }, [orderId, user?.id]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [authReady, load]);

  if (!authReady) {
    return <p className="mt-10 text-sm text-ink-muted">Checking session…</p>;
  }

  if (!configured || !user) {
    return (
      <div className="mt-10 space-y-4">
        <p className="text-ink-muted">Sign in to view this order.</p>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="cursor-pointer rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-deep"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (loading) {
    return <p className="mt-10 text-sm text-ink-muted">Loading order…</p>;
  }

  if (!order) {
    return (
      <div className="mt-10 space-y-4">
        <p className="text-sm text-red-600">{error || "Order not found."}</p>
        <Link
          href="/orders"
          className="inline-flex text-sm font-semibold text-teal hover:underline"
        >
          ← Back to my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div>
        <Link
          href="/orders"
          className="text-sm font-semibold text-teal hover:underline"
        >
          ← Back to my orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl font-bold text-ink">
            {order.orderNumber}
          </h2>
          <OrderStatusChip status={order.status} />
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Placed {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Items
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            {order.itemCount}
          </p>
        </div>
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Total
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            {formatLkr(order.totalLkr)}
          </p>
        </div>
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Notes
          </p>
          <p className="mt-2 text-sm text-ink-muted">{order.notes || "—"}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-[0.1em] text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Brand</th>
              <th className="px-4 py-3 font-semibold">Qty</th>
              <th className="px-4 py-3 font-semibold">Unit price</th>
              <th className="px-4 py-3 font-semibold">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-mist/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-medium text-ink hover:text-teal hover:underline"
                  >
                    {item.productName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">{item.productBrand}</td>
                <td className="px-4 py-3 text-ink-muted">{item.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                  {formatLkr(item.unitPriceLkr)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-ink">
                  {formatLkr(item.lineTotalLkr)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
