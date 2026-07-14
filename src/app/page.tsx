import Image from "next/image";
import Link from "next/link";
import { HomeProductSections } from "@/components/HomeProductSections";
import { generalOrderUrl } from "@/lib/whatsapp";

const collections = [
  {
    label: "Fashion",
    href: "/products?category=fashion",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Bags",
    href: "/products?category=bags",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a67478a?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Watches",
    href: "/products?category=watches",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Perfumes",
    href: "/products?category=perfumes",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/92 to-paper/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-paper/40" />
        <div className="relative mx-auto flex min-h-[100svh] w-full items-center px-5 pb-16 pt-28 sm:px-8 lg:px-[200px]">
          <div className="max-w-xl">
            <p className="animate-fade-up font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              LuXe <span className="text-teal">Euro</span>
            </p>
            <h1 className="animate-fade-up delay-1 mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Italian luxury.
              <br />
              Sri Lankan price.
            </h1>
            <p className="animate-fade-up delay-2 mt-5 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
              Authentic European brands — sourced in Italy, delivered to your
              door. Up to 55% below local market pricing.
            </p>
            <div className="animate-fade-up delay-3 mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal"
              >
                Shop catalogue
              </Link>
              <a
                href={generalOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md border border-ink/15 bg-white/80 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:border-teal hover:text-teal"
              >
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-10">
        <div className="mx-auto grid w-full gap-8 px-5 sm:grid-cols-3 sm:px-8 lg:px-[200px]">
          {[
            {
              title: "Sourced in Italy",
              body: "Verified retailers and seasonal outlets — original packaging and tags.",
            },
            {
              title: "Clear pricing",
              body: "See our price next to typical Sri Lankan market rates on every item.",
            },
            {
              title: "WhatsApp ordering",
              body: "Ask questions, request items, and place orders in one chat thread.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-display text-lg font-semibold text-ink">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full px-5 py-20 sm:px-8 lg:px-[200px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              Collections
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">
              Shop by category
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-semibold text-teal hover:text-teal-deep sm:inline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative aspect-[4/5] overflow-hidden bg-mist"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-ink/35 transition group-hover:bg-ink/45" />
              <span className="absolute inset-x-0 bottom-0 p-4 font-display text-xl font-semibold text-white">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <HomeProductSections />
    </>
  );
}
