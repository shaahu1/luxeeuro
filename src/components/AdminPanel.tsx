"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import { toProductInsert } from "@/lib/catalog";
import { normalizeImageUrl } from "@/lib/image-url";
import {
  categories,
  formatLkr,
  seedProducts,
  slugify,
  type Category,
  type Product,
} from "@/data/products";

const categoryOptions = categories.filter((c) => c.id !== "all") as {
  id: Category;
  label: string;
}[];

const emptyForm = {
  name: "",
  brand: "",
  description: "",
  category: "fashion" as Category,
  priceLkr: "",
  marketPriceLkr: "",
  quantity: "0",
  image: "",
  origin: "Italy",
  isNew: true,
  featured: false,
};

const emptyFilters = {
  name: "",
  brand: "",
  category: "all" as Category | "all",
  origin: "",
  priceMin: "",
  priceMax: "",
};

export function AdminPanel() {
  const { user, ready: authReady, configured, signInWithGoogle } = useAuth();
  const { products, ready: catalogReady, source, refresh } =
    useProducts();
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const admin = isAdminEmail(user?.email);
  const slugPreview = useMemo(() => {
    if (editingSlug) return editingSlug;
    return slugify(`${form.brand} ${form.name}`);
  }, [form.brand, form.name, editingSlug]);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditingSlug(product.slug);
    setForm({
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: product.category,
      priceLkr: String(product.priceLkr),
      marketPriceLkr: String(product.marketPriceLkr),
      quantity: String(product.quantity ?? 0),
      image: product.image,
      origin: product.origin,
      isNew: Boolean(product.isNew),
      featured: Boolean(product.featured),
    });
    setShowAddForm(true);
    setFormError(null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowAddForm(false);
    setEditingId(null);
    setEditingSlug(null);
    setForm(emptyForm);
    setFormError(null);
  }

  const origins = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.origin).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.brand).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const nameQ = filters.name.trim().toLowerCase();
    const brandQ = filters.brand.trim().toLowerCase();
    const originQ = filters.origin.trim().toLowerCase();
    const min = filters.priceMin === "" ? null : Number(filters.priceMin);
    const max = filters.priceMax === "" ? null : Number(filters.priceMax);

    return products.filter((p) => {
      if (nameQ && !p.name.toLowerCase().includes(nameQ)) return false;
      if (brandQ && !p.brand.toLowerCase().includes(brandQ)) return false;
      if (filters.category !== "all" && p.category !== filters.category) {
        return false;
      }
      if (originQ && !p.origin.toLowerCase().includes(originQ)) return false;
      if (min !== null && Number.isFinite(min) && p.priceLkr < min) return false;
      if (max !== null && Number.isFinite(max) && p.priceLkr > max) return false;
      return true;
    });
  }, [products, filters]);

  if (!authReady) {
    return <p className="mt-10 text-sm text-ink-muted">Checking session…</p>;
  }

  if (!configured) {
    return (
      <div className="mt-8 rounded-md border border-line bg-mist/60 p-5 text-sm text-ink-muted">
        Configure Supabase in <code className="text-ink">.env.local</code> first.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-10 space-y-4">
        <p className="text-ink-muted">
          Sign in with Google using your admin email to manage products.
        </p>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="cursor-pointer rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-deep"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setMessage(null);

    const priceLkr = Number(form.priceLkr);
    const marketPriceLkr = Number(form.marketPriceLkr);
    const quantity = Number(form.quantity);
    if (!form.name.trim() || !form.brand.trim() || !form.image.trim()) {
      setFormError("Name, brand, and image URL are required.");
      return;
    }
    if (!Number.isFinite(priceLkr) || priceLkr < 0) {
      setFormError("Enter a valid price.");
      return;
    }
    if (!Number.isFinite(marketPriceLkr) || marketPriceLkr < 0) {
      setFormError("Enter a valid market price.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      setFormError("Enter a valid stock quantity (0 or more).");
      return;
    }

    const slug = editingSlug || slugPreview || slugify(form.name);
    if (!slug) {
      setFormError("Could not build a slug from the name.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = toProductInsert({
      slug,
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      category: form.category,
      priceLkr,
      marketPriceLkr,
      quantity,
      image: normalizeImageUrl(form.image.trim()),
      origin: form.origin.trim() || "Italy",
      isNew: form.isNew,
      featured: form.featured,
    });

    const result = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);

    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setEditingSlug(null);
    setMessage(editingId ? "Product updated." : "Product added.");
    setShowAddForm(false);
    await refresh();
  }

  async function onDelete(product: Product) {
    if (!confirm(`Delete “${product.name}”?`)) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      setFormError(deleteError.message);
      return;
    }
    setMessage(`Deleted ${product.name}.`);
    await refresh();
  }

  async function importSeed() {
    setImporting(true);
    setFormError(null);
    setMessage(null);
    const supabase = createClient();
    const rows = seedProducts.map((p) =>
      toProductInsert({
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        description: p.description,
        category: p.category,
        priceLkr: p.priceLkr,
        marketPriceLkr: p.marketPriceLkr,
        quantity: p.quantity ?? 10,
        image: p.image,
        origin: p.origin,
        isNew: p.isNew,
        featured: p.featured,
      }),
    );
    const { error: importError } = await supabase.from("products").upsert(rows, {
      onConflict: "slug",
    });
    setImporting(false);
    if (importError) {
      setFormError(importError.message);
      return;
    }
    setMessage(`Imported ${rows.length} sample products.`);
    await refresh();
  }

  const inputClass =
    "mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-ink-muted">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            aria-label="Refresh products"
            title="Refresh"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line text-ink transition hover:border-teal hover:text-teal"
          >
            <RefreshIcon />
          </button>
          <button
            type="button"
            onClick={() => {
              if (showAddForm) {
                closeForm();
              } else {
                setEditingId(null);
                setEditingSlug(null);
                setForm(emptyForm);
                setShowAddForm(true);
              }
            }}
            className="cursor-pointer rounded-md bg-teal px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-teal-deep"
          >
            {showAddForm ? "Close form" : "Add product"}
          </button>
          <Link
            href="/admin/orders"
            className="cursor-pointer rounded-md border border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink hover:border-teal hover:text-teal"
          >
            Orders
          </Link>
          <Link
            href="/products"
            className="cursor-pointer rounded-md border border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink hover:border-teal hover:text-teal"
          >
            View store
          </Link>
        </div>
      </div>

      {(formError || message) && (
        <p
          className={`text-sm ${formError ? "text-red-600" : "text-teal-deep"}`}
          role={formError ? "alert" : "status"}
        >
          {formError || message}
        </p>
      )}

      {source === "seed" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-ink">
          <p className="font-semibold">Database table not ready or empty</p>
          <p className="mt-1 text-ink-muted">
            Run <code className="text-ink">supabase/products.sql</code> in the
            Supabase SQL Editor, then import samples.
          </p>
          <button
            type="button"
            disabled={importing}
            onClick={() => void importSeed()}
            className="mt-3 cursor-pointer rounded-md bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-teal disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import sample products"}
          </button>
        </div>
      )}

      {source === "supabase" && products.length === 0 && (
        <button
          type="button"
          disabled={importing}
          onClick={() => void importSeed()}
          className="cursor-pointer rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-teal hover:text-teal disabled:opacity-60"
        >
          {importing ? "Importing…" : "Import sample products"}
        </button>
      )}

      {showAddForm && (
        <section className="rounded-md border border-line bg-white p-5">
          <h2 className="font-display text-xl font-bold text-ink">
            {editingId ? "Edit product" : "Add product"}
          </h2>
          <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Name
              </span>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Brand
              </span>
              <input
                required
                value={form.brand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Description
              </span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Category
              </span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as Category,
                  }))
                }
                className={inputClass}
              >
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Origin
              </span>
              <input
                value={form.origin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origin: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Price (LKR)
              </span>
              <input
                required
                type="number"
                min={0}
                value={form.priceLkr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceLkr: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Market price (LKR)
              </span>
              <input
                required
                type="number"
                min={0}
                value={form.marketPriceLkr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, marketPriceLkr: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Quantity (stock)
              </span>
              <input
                required
                type="number"
                min={0}
                step={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Image URL
              </span>
              <input
                required
                type="url"
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
                placeholder="https://... or Google Drive share link"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                Google Drive: share the file as “Anyone with the link”, then paste
                the share URL (we convert it automatically).
              </p>
            </label>
            <p className="text-xs text-ink-muted sm:col-span-2">
              Slug:{" "}
              <span className="font-mono text-ink">{slugPreview || "—"}</span>
              {editingId ? " (kept on edit)" : ""}
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isNew: e.target.checked }))
                }
              />
              New arrival
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
              />
              Featured
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-deep disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update product"
                    : "Save product"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="cursor-pointer rounded-md border border-line px-5 py-3 text-sm font-semibold text-ink hover:border-teal hover:text-teal"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-end gap-3">
          <p className="text-sm text-ink-muted">
            Showing {catalogReady ? filteredProducts.length : "…"} of{" "}
            {catalogReady ? products.length : "…"}
          </p>
        </div>

        <div className="mt-5 grid gap-3 rounded-md border border-line bg-mist/40 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Name
            </span>
            <input
              value={filters.name}
              onChange={(e) =>
                setFilters((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Search name"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Brand
            </span>
            <select
              value={filters.brand}
              onChange={(e) =>
                setFilters((f) => ({ ...f, brand: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Category
            </span>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  category: e.target.value as Category | "all",
                }))
              }
              className={inputClass}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Origin
            </span>
            <select
              value={filters.origin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, origin: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">All origins</option>
              {origins.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Min price
            </span>
            <input
              type="number"
              min={0}
              value={filters.priceMin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priceMin: e.target.value }))
              }
              placeholder="0"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Max price
            </span>
            <input
              type="number"
              min={0}
              value={filters.priceMax}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priceMax: e.target.value }))
              }
              placeholder="Any"
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setFilters(emptyFilters)}
            className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-ink-muted hover:text-teal"
          >
            Clear filters
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-[0.1em] text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Origin</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Market</th>
                <th className="px-4 py-3 font-semibold">Flags</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link
                      href={`/products/${product.slug}`}
                      className="cursor-pointer text-ink transition hover:text-teal hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{product.brand}</td>
                  <td className="px-4 py-3 capitalize text-ink-muted">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{product.origin}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-ink">
                    {formatLkr(product.priceLkr)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                    {product.quantity ?? 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                    {formatLkr(product.marketPriceLkr)}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {[
                      product.isNew ? "New" : null,
                      product.featured ? "Featured" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {source === "supabase" && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            title="Edit"
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink transition hover:bg-teal-soft hover:text-teal"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDelete(product)}
                            aria-label={`Delete ${product.name}`}
                            title="Delete"
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
                          >
                            <DeleteIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {catalogReady && filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-ink-muted"
                  >
                    No products match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
