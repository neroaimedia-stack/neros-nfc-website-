"use client";

import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { formatCurrency } from "@/lib/currency";
import ProductThumb from "@/components/admin/ProductThumb";

type Promo = {
  code: string;
  discount_rate: number;
  active: boolean;
  created_at: string;
  product_slugs: string[];
};

type ProductOption = { slug: string; title: string; price: number; colors: string[] };

function ProductScopePicker({
  products,
  selected,
  discountPercent,
  onToggle,
}: {
  products: ProductOption[];
  selected: string[];
  discountPercent: number;
  onToggle: (slug: string) => void;
}) {
  const discounted = discountPercent > 0 && discountPercent <= 100;

  return (
    <div>
      <p className="text-xs font-medium text-black/50">
        Applies to <span className="font-normal">(leave all unchecked for every product)</span>
      </p>
      <div className="mt-1.5 flex flex-col gap-2">
        {products.map((p) => {
          const active = selected.includes(p.slug);
          const afterPrice = discounted ? p.price * (1 - discountPercent / 100) : null;
          return (
            <div
              key={p.slug}
              role="button"
              tabIndex={0}
              onClick={() => onToggle(p.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(p.slug);
                }
              }}
              aria-pressed={active}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 ${
                active ? "border-black bg-black/[0.03]" : "border-black/10 hover:border-black/25"
              }`}
            >
              <ProductThumb slug={p.slug} variant={p.colors[0] ?? ""} className="pointer-events-none w-12 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">{p.title}</span>
              <span className="shrink-0 text-right text-sm whitespace-nowrap">
                {afterPrice != null ? (
                  <>
                    <span className="text-black/40 line-through">{formatCurrency(p.price, "USD")}</span>
                    <span className="mx-1 text-black/30">→</span>
                    <span className="font-semibold text-black">{formatCurrency(afterPrice, "USD")}</span>
                  </>
                ) : (
                  <span className="text-black/60">{formatCurrency(p.price, "USD")}</span>
                )}
              </span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  active ? "border-black bg-black text-white" : "border-black/20"
                }`}
              >
                {active && <FiCheck className="h-3 w-3" />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PromosManager() {
  const [promos, setPromos] = useState<Promo[] | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [scopeSlugs, setScopeSlugs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editScope, setEditScope] = useState<string[]>([]);
  const [savingScope, setSavingScope] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/promos");
    const data = await res.json();
    if (res.ok) setPromos(data.promos);
  };

  useEffect(() => {
    load();
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) {
          setProducts(
            data.products.map((p: { slug: string; title: string; price: number; colors: string[] }) => ({
              slug: p.slug,
              title: p.title,
              price: Number(p.price),
              colors: p.colors ?? [],
            }))
          );
        }
      });
  }, []);

  const addPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const rate = Number(percent) / 100;
    setSaving(true);
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, discount_rate: rate, product_slugs: scopeSlugs }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setCode("");
    setPercent("");
    setScopeSlugs([]);
    load();
  };

  const toggleActive = async (promo: Promo) => {
    await fetch(`/api/admin/promos/${encodeURIComponent(promo.code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !promo.active }),
    });
    load();
  };

  const deletePromo = async (promo: Promo) => {
    if (!confirm(`Delete promo code "${promo.code}"? This can't be undone.`)) return;
    await fetch(`/api/admin/promos/${encodeURIComponent(promo.code)}`, {
      method: "DELETE",
    });
    load();
  };

  const startEditScope = (promo: Promo) => {
    setEditingCode(promo.code);
    setEditScope(promo.product_slugs);
  };

  const saveScope = async (promo: Promo) => {
    setSavingScope(true);
    await fetch(`/api/admin/promos/${encodeURIComponent(promo.code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_slugs: editScope }),
    });
    setSavingScope(false);
    setEditingCode(null);
    load();
  };

  return (
    <div>
      <form onSubmit={addPromo} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white shadow-sm p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="CODE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="min-w-0 flex-1 rounded-xl border border-black/15 px-4 py-2.5 text-sm uppercase outline-none focus:border-black"
          />
          <input
            type="number"
            placeholder="% off"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            required
            className="w-24 rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
        </div>
        {products.length > 0 && (
          <ProductScopePicker
            products={products}
            selected={scopeSlugs}
            discountPercent={Number(percent)}
            onToggle={(slug) =>
              setScopeSlugs((prev) =>
                prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
              )
            }
          />
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? "Adding…" : "+ Add promo code"}
        </button>
      </form>

      <div className="mt-6 flex flex-col rounded-2xl border border-black/10 bg-white shadow-sm px-4">
        {promos === null && <p className="py-3 text-sm text-black/40">Loading…</p>}
        {promos?.length === 0 && <p className="py-3 text-sm text-black/40">No promo codes yet.</p>}
        {promos?.map((promo) => (
          <div key={promo.code} className="border-b border-black/10 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-black">{promo.code}</p>
                <p className="text-xs text-black/40">
                  {Math.round(promo.discount_rate * 100)}% off · {promo.active ? "Active" : "Inactive"} ·{" "}
                  {promo.product_slugs.length === 0
                    ? "All products"
                    : `${promo.product_slugs.length} product${promo.product_slugs.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => (editingCode === promo.code ? setEditingCode(null) : startEditScope(promo))}
                  className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-60"
                >
                  {editingCode === promo.code ? "Close" : "Edit scope"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(promo)}
                  className="rounded-full border border-black px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-60"
                >
                  {promo.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => deletePromo(promo)}
                  className="rounded-full border border-red-600 px-3 py-1.5 text-xs font-semibold text-red-600 transition-opacity hover:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingCode === promo.code && (
              <div className="mt-3 rounded-xl bg-black/[0.03] p-3">
                <ProductScopePicker
                  products={products}
                  selected={editScope}
                  discountPercent={Math.round(promo.discount_rate * 100)}
                  onToggle={(slug) =>
                    setEditScope((prev) =>
                      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => saveScope(promo)}
                  disabled={savingScope}
                  className="mt-3 rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {savingScope ? "Saving…" : "Save scope"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
