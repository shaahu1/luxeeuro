"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatLkr } from "@/data/products";
import {
  fetchMyOrders,
  type OrderRecord,
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

export function MyOrdersPanel() {
  const { user, ready: authReady, configured, signInWithGoogle } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await fetchMyOrders(user.id);
    setOrders(result.orders);
    setError(result.error);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [authReady, load]);

  if (!authReady) {
    return <p className="mt-10 text-sm text-ink-muted">Checking session…</p>;
  }

  if (!configured) {
    return (
      <div className="mt-8 rounded-md border border-line bg-mist/60 p-5 text-sm text-ink-muted">
        Sign-in is not configured yet.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-10 space-y-4">
        <p className="text-ink-muted">
          Sign in to view orders you placed from your account.
        </p>
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

  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {loading ? "Loading…" : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
        </p>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="Refresh orders"
          title="Refresh"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line text-ink transition hover:border-teal hover:text-teal"
        >
          <RefreshIcon />
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-md border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-[0.1em] text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Order #</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-mist/40">
                <td className="px-4 py-3 font-medium text-ink">
                  <Link
                    href={`/orders/${order.id}`}
                    className="cursor-pointer text-teal hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">{order.itemCount}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-ink">
                  {formatLkr(order.totalLkr)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusChip status={order.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-ink-muted"
                >
                  No orders yet.{" "}
                  <Link href="/products" className="text-teal hover:underline">
                    Browse products
                  </Link>{" "}
                  and place an order from your cart.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-ink-muted"
                >
                  Loading your orders…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
