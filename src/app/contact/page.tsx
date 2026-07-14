import type { Metadata } from "next";
import {
  WHATSAPP_DISPLAY,
  generalOrderUrl,
  requestProductUrl,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact LuXe Euro on WhatsApp for orders, product requests, and delivery questions.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-28 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        Contact
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Let’s talk on WhatsApp
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-muted">
        No online checkout. Browse the catalogue, then message us to confirm
        stock, shipping, and payment details.
      </p>

      <div className="mt-10 space-y-6 border-y border-line py-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            WhatsApp
          </p>
          <a
            href={generalOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-display text-2xl font-semibold text-teal hover:text-teal-deep"
          >
            {WHATSAPP_DISPLAY}
          </a>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Based in
          </p>
          <p className="mt-2 text-ink">Italy · Shipping to Sri Lanka</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href={generalOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-deep"
        >
          Start an order
        </a>
        <a
          href={requestProductUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-teal hover:text-teal"
        >
          Request a product
        </a>
      </div>
    </div>
  );
}
