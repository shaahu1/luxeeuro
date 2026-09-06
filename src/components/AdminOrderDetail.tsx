"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatLkr } from "@/data/products";
import {
  fetchOrderDetail,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  orderStatusLabel,
  updateOrderStatus,
  type OrderDetail,
  type OrderStatus,
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

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchOrderDetail(orderId, { admin: true });
    setOrder(result.order);
    setError(result.error);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onStatusChange(status: OrderStatus) {
    if (!order || status === order.status) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const result = await updateOrderStatus(order.id, status);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOrder({ ...order, status });
    setMessage(`Status updated to ${orderStatusLabel(status)}.`);
  }

  if (loading) {
    return <p className="mt-10 text-sm text-ink-muted">Loading order…</p>;
  }

  if (!order) {
    return (
      <div className="mt-10 space-y-4">
        <p className="text-sm text-red-600">{error || "Order not found."}</p>
        <Link
          href="/admin/orders"
          className="inline-flex text-sm font-semibold text-teal hover:underline"
        >
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-teal hover:underline"
          >
            ← Back to orders
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

        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Status
          </span>
          <select
            value={order.status}
            disabled={saving}
            onChange={(e) =>
              void onStatusChange(e.target.value as OrderStatus)
            }
            className="mt-1.5 block min-w-[180px] cursor-pointer rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal disabled:opacity-60"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
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
      {message && (
        <p className="text-sm text-teal-deep" role="status">
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Customer
          </p>
          <p className="mt-2 font-semibold text-ink">
            {order.customerName || "Guest"}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {order.customerEmail || "No email"}
          </p>
        </div>
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
