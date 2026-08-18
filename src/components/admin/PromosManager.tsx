"use client";

import { useEffect, useState } from "react";

type Promo = {
  code: string;
  discount_rate: number;
  active: boolean;
  created_at: string;
  product_slugs: string[];
};

type ProductOption = { slug: string; title: string };

function ProductScopePicker({
  products,
  selected,
  onToggle,
}: {
  products: ProductOption[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-black/50">
        Applies to <span className="font-normal">(leave all unchecked for every product)</span>
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {products.map((p) => {
          const active = selected.includes(p.slug);
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => onToggle(p.slug)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "border-black bg-black text-white" : "border-black/15 text-black/70"
              }`}
            >
              {p.title}
            </button>
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
          setProducts(data.products.map((p: { slug: string; title: string }) => ({ slug: p.slug, title: p.title })));
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
      <form onSubmit={addPromo} className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4">
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

      <div className="mt-6 flex flex-col">
        {promos === null && <p className="text-sm text-black/40">Loading…</p>}
        {promos?.length === 0 && <p className="text-sm text-black/40">No promo codes yet.</p>}
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
