"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getUserDisplayName } from "@/lib/user";
import { isAdminEmail } from "@/lib/admin";

const links = [
  { href: "/", label: "Home" },
  { href: "/products?new=1", label: "New" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const base = href.split("?")[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function Header() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const { user, ready: authReady, signOut, configured } = useAuth();
  const isAdmin = Boolean(user && isAdminEmail(user.email));
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const showAuth = mounted && authReady;
  const showCartCount = mounted && ready && count > 0;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line/80 bg-paper/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between px-5 sm:h-[4.5rem] sm:px-8 lg:px-[200px]">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            LuXe
          </span>
          <span className="font-display text-xl font-medium tracking-tight text-teal sm:text-2xl">
            Euro
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {showAuth && configured && user ? (
            <div className="hidden items-center gap-2 sm:flex">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="cursor-pointer rounded-md border border-teal/30 bg-teal-soft px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-teal-deep transition hover:bg-teal hover:text-white"
                >
                  Admin
                </Link>
              )}
              {!isAdmin && (
                <span
                  className="max-w-[180px] truncate font-display text-base font-semibold text-teal sm:text-lg"
                  title={user.email ?? undefined}
                >
                  Hi, {getUserDisplayName(user)}
                </span>
              )}
              <button
                type="button"
                onClick={() => signOut()}
                className="cursor-pointer rounded-md border border-line bg-white/80 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-teal hover:text-teal"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden cursor-pointer rounded-md border border-line bg-white/80 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-teal hover:text-teal sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/cart"
            className="relative inline-flex cursor-pointer items-center rounded-md border border-line bg-white/80 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-teal hover:text-teal"
          >
            Cart
            {showCartCount && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-teal px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-line md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <div className="flex w-4 flex-col gap-1">
              <span
                className={`h-px w-full bg-ink transition ${open ? "translate-y-[5px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-full bg-ink transition ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px w-full bg-ink transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-paper px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-lg font-semibold text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              className="font-display text-lg font-semibold text-teal"
            >
              Cart{showCartCount ? ` (${count})` : ""}
            </Link>
            {showAuth && configured && user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="font-display text-lg font-semibold text-teal"
                  >
                    Admin
                  </Link>
                )}
                {!isAdmin && (
                  <p className="font-display text-xl font-semibold text-teal">
                    Hi, {getUserDisplayName(user)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="cursor-pointer text-left font-display text-lg font-semibold text-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-display text-lg font-semibold text-ink"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="font-display text-lg font-semibold text-teal"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
