import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import { getSiteOrigin } from "@/lib/whatsapp";

type Body = {
  to?: string;
  orderNumber?: string;
  customerName?: string | null;
  totalLkr?: number;
  items?: Array<{
    brand: string;
    name: string;
    quantity: number;
    unitPriceLkr: number;
    lineTotalLkr: number;
  }>;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const to = body.to?.trim().toLowerCase() ?? "";
  const orderNumber = body.orderNumber?.trim() ?? "";
  const items = body.items ?? [];
  const totalLkr = Number(body.totalLkr);

  if (!to || !isValidEmail(to)) {
    return NextResponse.json(
      { error: "A valid customer email is required." },
      { status: 400 },
    );
  }
  if (!orderNumber) {
    return NextResponse.json(
      { error: "Order number is required." },
      { status: 400 },
    );
  }
  if (!items.length || !Number.isFinite(totalLkr)) {
    return NextResponse.json(
      { error: "Order items and total are required." },
      { status: 400 },
    );
  }

  const origin = getSiteOrigin(new URL(request.url).origin);
  const result = await sendOrderConfirmationEmail({
    to,
    orderNumber,
    customerName: body.customerName,
    items,
    totalLkr,
    ordersUrl: `${origin}/orders`,
  });

  if (!result.sent) {
    const missingKey = /RESEND_API_KEY/i.test(result.error ?? "");
    return NextResponse.json(
      {
        sent: false,
        configured: !missingKey,
        error: result.error,
      },
      { status: missingKey ? 503 : 502 },
    );
  }

  return NextResponse.json({ sent: true, configured: true });
}
