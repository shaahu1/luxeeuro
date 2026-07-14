import type { Metadata } from "next";
import Link from "next/link";
import { generalOrderUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About",
  description:
    "LuXe Euro sources authentic Italian and European brands and delivers them to Sri Lanka with transparent pricing.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-28 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        About LuXe Euro
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Real brands. Real savings. Real trust.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-muted">
        We are based in Italy and personally source discounted branded items
        from authorised outlets and seasonal sales. Every product is 100%
        authentic — we never deal in replicas.
      </p>

      <ul className="mt-10 space-y-4 text-ink">
        {[
          "Personally sourced from Italy by our team",
          "Original packaging and tags on every order",
          "Transparent pricing — market price vs our price",
          "Direct WhatsApp communication — no middlemen",
          "Delivered to customers across Sri Lanka",
        ].map((item) => (
          <li key={item} className="flex gap-3 text-sm sm:text-base">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/products"
          className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-teal"
        >
          Browse products
        </Link>
        <a
          href={generalOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-teal hover:text-teal"
        >
          WhatsApp us
        </a>
      </div>
    </div>
  );
}
