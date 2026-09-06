import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { OrderLine } from "@/lib/whatsapp";
import type { User } from "@supabase/supabase-js";
import {
  applyStockDeltaForLines,
  fetchOrderStockLines,
} from "@/lib/stock";

export type OrderStatus =
  | "order_placed"
  | "in_transit"
  | "delivered"
  | "canceled";

export const ORDER_STATUSES: OrderStatus[] = [
  "order_placed",
  "in_transit",
  "delivered",
  "canceled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  order_placed: "Order Placed",
  in_transit: "In-transit",
  delivered: "Delivered",
  canceled: "Canceled",
};

export function orderStatusLabel(status: OrderStatus | string): string {
  if (status in ORDER_STATUS_LABELS) {
    return ORDER_STATUS_LABELS[status as OrderStatus];
  }
  return status;
}

export function orderStatusClass(status: OrderStatus | string): string {
  switch (normalizeStatus(status)) {
    case "order_placed":
      return "bg-amber-50 text-amber-800";
    case "in_transit":
      return "bg-blue-50 text-blue-800";
    case "delivered":
      return "bg-green-50 text-green-800";
    case "canceled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-mist text-ink-muted";
  }
}

export type CreatedOrder = {
  id: string;
  orderNumber: string;
  totalLkr: number;
  itemCount: number;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  status: OrderStatus;
  totalLkr: number;
  itemCount: number;
  notes: string;
  createdAt: string;
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string | null;
  productSlug: string;
  productName: string;
  productBrand: string;
  unitPriceLkr: number;
  quantity: number;
  lineTotalLkr: number;
};

export type OrderDetail = OrderRecord & {
  items: OrderItemRecord[];
};

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  status: string;
  total_lkr: number;
  item_count: number;
  notes: string;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string;
  product_name: string;
  product_brand: string;
  unit_price_lkr: number;
  quantity: number;
  line_total_lkr: number;
};

function normalizeStatus(status: string): OrderStatus {
  switch (status) {
    case "order_placed":
    case "in_transit":
    case "delivered":
    case "canceled":
      return status;
    case "pending":
    case "confirmed":
      return "order_placed";
    case "shipped":
      return "in_transit";
    case "cancelled":
      return "canceled";
    default:
      return "order_placed";
  }
}

/** Map to legacy DB values if orders_status_check was never migrated.
 * Note: old DB has no "delivered" equivalent — that status needs the migration.
 */
function legacyDbStatus(status: OrderStatus): string | null {
  switch (status) {
    case "order_placed":
      return "pending";
    case "in_transit":
      return "shipped";
    case "canceled":
      return "cancelled";
    case "delivered":
      return null;
    default:
      return null;
  }
}

function isStatusConstraintError(message: string | undefined) {
  return Boolean(
    message && /orders_status_check|check constraint|violates check/i.test(message),
  );
}

const STATUS_MIGRATION_HINT =
  "Database status values are outdated. In Supabase → SQL Editor, run the SQL in supabase/orders_status_migration.sql, then try again.";

function mapOrder(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    status: normalizeStatus(row.status),
    totalLkr: row.total_lkr,
    itemCount: row.item_count,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapOrderItem(row: OrderItemRow): OrderItemRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    productBrand: row.product_brand,
    unitPriceLkr: row.unit_price_lkr,
    quantity: row.quantity,
    lineTotalLkr: row.line_total_lkr,
  };
}

function buildOrderNumber() {
  const now = new Date();
  const date =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LX-${date}-${rand}`;
}

export async function createOrderFromCart(options: {
  items: OrderLine[];
  user: User | null;
  customerEmail?: string | null;
}): Promise<{ order: CreatedOrder | null; error: string | null }> {
  const { items, user, customerEmail } = options;

  if (!items.length) {
    return { order: null, error: "Cart is empty." };
  }

  if (!isSupabaseConfigured()) {
    return {
      order: null,
      error: "Orders are not configured. Add Supabase keys first.",
    };
  }

  const totalLkr = items.reduce(
    (sum, item) => sum + item.product.priceLkr * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const orderNumber = buildOrderNumber();

  const meta = user?.user_metadata ?? {};
  const customerName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.given_name === "string" && meta.given_name) ||
    null;

  const email =
    (customerEmail?.trim() || user?.email || "").trim().toLowerCase() || null;

  try {
    const supabase = createClient();

    const orderPayload = {
      order_number: orderNumber,
      user_id: user?.id ?? null,
      customer_email: email,
      customer_name: customerName,
      status: "order_placed" as const,
      total_lkr: totalLkr,
      item_count: itemCount,
      notes: "Placed via cart checkout",
    };

    let { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select("id, order_number, total_lkr, item_count, status")
      .single();

    // Legacy DB still using pending/confirmed/shipped/cancelled
    if (
      orderError &&
      /status|check|constraint/i.test(orderError.message)
    ) {
      const retry = await supabase
        .from("orders")
        .insert({
          ...orderPayload,
          status: "pending" as unknown as "order_placed",
        })
        .select("id, order_number, total_lkr, item_count, status")
        .single();
      orderRow = retry.data;
      orderError = retry.error;
    }

    if (orderError || !orderRow) {
      return {
        order: null,
        error: orderError?.message ?? "Could not create order.",
      };
    }

    const orderItems = items.map((item) => ({
      order_id: orderRow.id,
      product_id: item.product.id,
      product_slug: item.product.slug,
      product_name: item.product.name,
      product_brand: item.product.brand,
      unit_price_lkr: item.product.priceLkr,
      quantity: item.quantity,
      line_total_lkr: item.product.priceLkr * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", orderRow.id);
      return { order: null, error: itemsError.message };
    }

    const stockResult = await applyStockDeltaForLines(
      items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      -1,
    );

    if (stockResult.error) {
      await supabase.from("orders").delete().eq("id", orderRow.id);
      return {
        order: null,
        error:
          stockResult.error.includes("Insufficient stock")
            ? "Not enough stock for one or more items."
            : stockResult.error,
      };
    }

    return {
      order: {
        id: orderRow.id,
        orderNumber: orderRow.order_number,
        totalLkr: orderRow.total_lkr,
        itemCount: orderRow.item_count,
      },
      error: null,
    };
  } catch (e) {
    return {
      order: null,
      error: e instanceof Error ? e.message : "Could not create order.",
    };
  }
}

export async function fetchOrders(): Promise<{
  orders: OrderRecord[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { orders: [], error: "Supabase is not configured." };
  }

  try {
    const supabase = createClient();
    // Admin list: every order (signed-in + guest), newest first
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, 9999);

    if (error) {
      return { orders: [], error: error.message };
    }

    return {
      orders: ((data ?? []) as OrderRow[]).map(mapOrder),
      error: null,
    };
  } catch (e) {
    return {
      orders: [],
      error: e instanceof Error ? e.message : "Could not load orders.",
    };
  }
}

export async function fetchMyOrders(userId: string): Promise<{
  orders: OrderRecord[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { orders: [], error: "Supabase is not configured." };
  }

  if (!userId) {
    return { orders: [], error: "Sign in to view your orders." };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { orders: [], error: error.message };
    }

    return {
      orders: ((data ?? []) as OrderRow[]).map(mapOrder),
      error: null,
    };
  } catch (e) {
    return {
      orders: [],
      error: e instanceof Error ? e.message : "Could not load orders.",
    };
  }
}

export async function fetchOrderDetail(
  id: string,
  options?: { userId?: string | null; admin?: boolean },
): Promise<{
  order: OrderDetail | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { order: null, error: "Supabase is not configured." };
  }

  try {
    const supabase = createClient();
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (orderError) {
      return { order: null, error: orderError.message };
    }
    if (!orderData) {
      return { order: null, error: "Order not found." };
    }

    const order = mapOrder(orderData as OrderRow);
    const isOwner = Boolean(options?.userId && order.userId === options.userId);
    if (!options?.admin && !isOwner) {
      return { order: null, error: "Order not found." };
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return { order: null, error: itemsError.message };
    }

    return {
      order: {
        ...order,
        items: ((itemsData ?? []) as OrderItemRow[]).map(mapOrderItem),
      },
      error: null,
    };
  } catch (e) {
    return {
      order: null,
      error: e instanceof Error ? e.message : "Could not load order.",
    };
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." };
  }

  try {
    const supabase = createClient();

    const { data: current, error: currentError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (currentError || !current) {
      return { error: currentError?.message ?? "Order not found." };
    }

    const previous = normalizeStatus(current.status);
    if (previous === status) {
      return { error: null };
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("status")
      .maybeSingle();

    let updatedOk = Boolean(data && normalizeStatus(data.status) === status);

    // DB still has old check: pending | confirmed | shipped | cancelled
    if (!updatedOk && error && isStatusConstraintError(error.message)) {
      const legacy = legacyDbStatus(status);
      if (!legacy) {
        return { error: STATUS_MIGRATION_HINT };
      }

      const { data: legacyData, error: legacyError } = await supabase
        .from("orders")
        .update({ status: legacy })
        .eq("id", id)
        .select("status")
        .maybeSingle();

      updatedOk = Boolean(
        !legacyError &&
          legacyData &&
          normalizeStatus(legacyData.status) === status,
      );

      if (!updatedOk) {
        return { error: STATUS_MIGRATION_HINT };
      }
    } else if (!updatedOk) {
      return {
        error: error?.message ?? STATUS_MIGRATION_HINT,
      };
    }

    // Restore stock when canceling; deduct again if un-canceling
    if (status === "canceled" && previous !== "canceled") {
      const stockLines = await fetchOrderStockLines(id);
      if (stockLines.error) {
        return { error: stockLines.error };
      }
      const stockResult = await applyStockDeltaForLines(stockLines.lines, 1);
      if (stockResult.error) {
        return { error: stockResult.error };
      }
    } else if (previous === "canceled" && status !== "canceled") {
      const stockLines = await fetchOrderStockLines(id);
      if (stockLines.error) {
        return { error: stockLines.error };
      }
      const stockResult = await applyStockDeltaForLines(stockLines.lines, -1);
      if (stockResult.error) {
        // Revert status back to canceled
        await supabase.from("orders").update({ status: "canceled" }).eq("id", id);
        return {
          error:
            stockResult.error.includes("Insufficient stock")
              ? "Not enough stock to reopen this canceled order."
              : stockResult.error,
        };
      }
    }

    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not update order.",
    };
  }
}
