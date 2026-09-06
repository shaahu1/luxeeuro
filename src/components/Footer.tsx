import Link from "next/link";
import { WHATSAPP_DISPLAY, generalOrderUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-white">
      <div className="mx-auto grid w-full gap-10 px-5 py-14 sm:px-8 lg:px-[200px] md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold tracking-tight">
            LuXe <span className="text-glow">Euro</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
            Authentic Italian and European brands delivered to Sri Lanka —
            transparent pricing, WhatsApp-first ordering.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white">
                All products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-white">
                My orders
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            Order
          </p>
          <p className="mt-4 text-sm text-white/70">
            Chat with us on WhatsApp
          </p>
          <a
            href={generalOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-semibold text-glow transition hover:text-white"
          >
            {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © 2026 LuXe Euro. Authentic brands from Italy & Europe.
      </div>
    </footer>
  );
}
