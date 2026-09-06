import { createClient } from "@/lib/supabase/client";

export type StockLine = {
  productId: string | null;
  quantity: number;
};

/** +delta increases stock, -delta decreases. Uses security-definer RPC. */
export async function adjustProductQuantity(
  productId: string,
  delta: number,
): Promise<{ error: string | null }> {
  if (!productId || !delta) return { error: null };

  try {
    const supabase = createClient();
    const { error } = await supabase.rpc("adjust_product_quantity", {
      p_product_id: productId,
      p_delta: delta,
    });

    if (error) {
      return {
        error:
          error.message.includes("adjust_product_quantity") ||
          error.message.includes("Could not find the function")
            ? "Stock column/RPC missing. Run supabase/products_quantity_migration.sql in Supabase."
            : error.message,
      };
    }

    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not update stock.",
    };
  }
}

export async function applyStockDeltaForLines(
  lines: StockLine[],
  direction: 1 | -1,
): Promise<{ error: string | null }> {
  const applied: StockLine[] = [];

  for (const line of lines) {
    if (!line.productId || line.quantity <= 0) continue;
    const result = await adjustProductQuantity(
      line.productId,
      direction * line.quantity,
    );
    if (result.error) {
      // Roll back what we already changed
      for (const done of applied.reverse()) {
        if (!done.productId) continue;
        await adjustProductQuantity(done.productId, -direction * done.quantity);
      }
      return { error: result.error };
    }
    applied.push(line);
  }

  return { error: null };
}

export async function fetchOrderStockLines(orderId: string): Promise<{
  lines: StockLine[];
  error: string | null;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (error) {
      return { lines: [], error: error.message };
    }

    return {
      lines: (data ?? []).map((row) => ({
        productId: row.product_id as string | null,
        quantity: Number(row.quantity) || 0,
      })),
      error: null,
    };
  } catch (e) {
    return {
      lines: [],
      error: e instanceof Error ? e.message : "Could not load order items.",
    };
  }
}
