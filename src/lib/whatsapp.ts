import type { Product } from "@/data/products";

/** Italian WhatsApp line from existing LuXe Euro site */
export const WHATSAPP_NUMBER = "393520253940";
export const WHATSAPP_DISPLAY = "+39 352 025 3940";

export type OrderLine = {
  quantity: number;
  product: Product;
};

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Prefer public site URL so WhatsApp can open the link (not localhost). */
export function getSiteOrigin(fallbackOrigin?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return (fallbackOrigin ?? "").replace(/\/$/, "");
}

function productPageUrl(product: Product, origin: string) {
  return `${origin}/products/${product.slug}`;
}

function formatPrice(amount: number) {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function orderProductMessage(product: Product, origin: string) {
  const base = getSiteOrigin(origin);
  const link = productPageUrl(product, base);
  return `Hi LuXe Euro — I'd like to order:

${product.brand} — ${product.name}
Price: LKR ${formatPrice(product.priceLkr)}

View product:
${link}

Please confirm availability and shipping to Sri Lanka.`;
}

export function orderProductUrl(product: Product, origin: string) {
  return whatsappUrl(orderProductMessage(product, origin));
}

export function orderCartMessage(
  items: OrderLine[],
  origin: string,
  orderNumber?: string,
) {
  const base = getSiteOrigin(origin);
  const lines = items.map((item, index) => {
    const link = productPageUrl(item.product, base);
    const lineTotal = item.product.priceLkr * item.quantity;
    return `${index + 1}. ${item.product.brand} — ${item.product.name}
Qty: ${item.quantity} × LKR ${formatPrice(item.product.priceLkr)} = LKR ${formatPrice(lineTotal)}

${link}`;
  });

  const total = items.reduce(
    (sum, item) => sum + item.product.priceLkr * item.quantity,
    0,
  );

  const orderLine = orderNumber ? `Order #: ${orderNumber}\n\n` : "";

  return `Hi LuXe Euro — I'd like to place this order from my cart:

${orderLine}${lines.join("\n\n")}

————————
Total: LKR ${formatPrice(total)}

Cart:
${base}/cart

Please confirm availability and shipping to Sri Lanka.`;
}

export function orderCartUrl(
  items: OrderLine[],
  origin: string,
  orderNumber?: string,
) {
  return whatsappUrl(orderCartMessage(items, origin, orderNumber));
}

export function generalOrderUrl() {
  return whatsappUrl(
    "Hi LuXe Euro — I'd like to browse and place an order. Looking for authentic Italian/European brands delivered to Sri Lanka.",
  );
}

export function requestProductUrl() {
  return whatsappUrl(
    "Hi LuXe Euro — I don't see what I need on the site. Can you source a specific brand/item for me?",
  );
}
