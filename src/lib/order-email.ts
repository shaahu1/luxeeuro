import { formatLkr } from "@/data/products";
import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export type OrderEmailLine = {
  brand: string;
  name: string;
  quantity: number;
  unitPriceLkr: number;
  lineTotalLkr: number;
};

export function buildOrderConfirmationEmail(options: {
  orderNumber: string;
  customerName?: string | null;
  items: OrderEmailLine[];
  totalLkr: number;
  ordersUrl?: string;
}) {
  const { orderNumber, customerName, items, totalLkr, ordersUrl } = options;
  const greeting = customerName ? `Hi ${customerName},` : "Hi,";

  const itemLines = items
    .map(
      (item) =>
        `• ${item.brand} — ${item.name}\n  Qty ${item.quantity} × ${formatLkr(item.unitPriceLkr)} = ${formatLkr(item.lineTotalLkr)}`,
    )
    .join("\n");

  const text = `${greeting}

Thank you for your LuXe Euro order.

Order #: ${orderNumber}
Status: Order Placed

${itemLines}

Total: ${formatLkr(totalLkr)}

We'll confirm availability and shipping on WhatsApp (${WHATSAPP_DISPLAY}).
${ordersUrl ? `\nView your order:\n${ordersUrl}\n` : ""}
— LuXe Euro
`;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #d8dde6;">
          <div style="font-weight:600;color:#12141a;">${escapeHtml(item.brand)} — ${escapeHtml(item.name)}</div>
          <div style="font-size:13px;color:#5c6370;margin-top:4px;">
            Qty ${item.quantity} × ${formatLkr(item.unitPriceLkr)}
          </div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #d8dde6;text-align:right;font-weight:600;color:#12141a;white-space:nowrap;">
          ${formatLkr(item.lineTotalLkr)}
        </td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:Arial,Helvetica,sans-serif;color:#12141a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#0a6b63;font-weight:700;margin:0;">LuXe Euro</p>
    <h1 style="font-size:24px;margin:12px 0 8px;">Order confirmed</h1>
    <p style="margin:0 0 20px;color:#5c6370;">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 20px;color:#5c6370;">Thank you for your order. We’ve saved it and will follow up on WhatsApp.</p>
    <div style="background:#fff;border:1px solid #d8dde6;border-radius:8px;padding:20px;">
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#5c6370;">Order #</p>
      <p style="margin:0 0 16px;font-size:20px;font-weight:700;">${escapeHtml(orderNumber)}</p>
      <p style="margin:0 0 16px;"><span style="display:inline-block;background:#d5ebe8;color:#08554f;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Order Placed</span></p>
      <table style="width:100%;border-collapse:collapse;">${itemRows}</table>
      <p style="margin:16px 0 0;font-size:18px;font-weight:700;text-align:right;">Total ${formatLkr(totalLkr)}</p>
    </div>
    <p style="margin:20px 0 0;color:#5c6370;font-size:14px;line-height:1.5;">
      WhatsApp: ${escapeHtml(WHATSAPP_DISPLAY)}
    </p>
    ${
      ordersUrl
        ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(ordersUrl)}" style="color:#0a6b63;font-weight:600;">View your orders</a></p>`
        : ""
    }
  </div>
</body>
</html>`;

  return {
    subject: `LuXe Euro order ${orderNumber} — Order Placed`,
    text,
    html,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendOrderConfirmationEmail(options: {
  to: string;
  orderNumber: string;
  customerName?: string | null;
  items: OrderEmailLine[];
  totalLkr: number;
  ordersUrl?: string;
}): Promise<{ sent: boolean; error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      error: "Email is not configured (missing RESEND_API_KEY).",
    };
  }

  const from =
    process.env.ORDER_EMAIL_FROM?.trim() ||
    "LuXe Euro <onboarding@resend.dev>";

  const content = buildOrderConfirmationEmail(options);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        sent: false,
        error: body || `Email provider error (${response.status}).`,
      };
    }

    return { sent: true, error: null };
  } catch (e) {
    return {
      sent: false,
      error: e instanceof Error ? e.message : "Could not send email.",
    };
  }
}
