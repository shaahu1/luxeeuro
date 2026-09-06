"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatLkr } from "@/data/products";
import {
  fetchOrders,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/orders";
import { OrderStatusChip } from "@/components/OrderStatusChip";

const statuses: Array<OrderStatus | "all"> = ["all", ...ORDER_STATUSES];

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

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchOrders();
    setOrders(result.orders);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!q) return true;
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        (order.customerEmail ?? "").toLowerCase().includes(q) ||
        (order.customerName ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, query]);

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Showing {loading ? "…" : filtered.length} of{" "}
          {loading ? "…" : orders.length}
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

      <div className="grid gap-3 rounded-md border border-line bg-mist/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order #, name, email"
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "all")
            }
            className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
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
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-mist/40">
                <td className="px-4 py-3 font-medium text-ink">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="cursor-pointer text-teal hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  <div>{order.customerName || "Guest"}</div>
                  <div className="text-xs">{order.customerEmail || "—"}</div>
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
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-ink-muted"
                >
                  No orders found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-ink-muted"
                >
                  Loading orders…
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
