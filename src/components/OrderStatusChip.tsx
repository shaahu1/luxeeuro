import {
  orderStatusClass,
  orderStatusLabel,
  type OrderStatus,
} from "@/lib/orders";

export function OrderStatusChip({
  status,
  className = "",
}: {
  status: OrderStatus | string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${orderStatusClass(status)} ${className}`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
