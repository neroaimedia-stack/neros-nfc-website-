"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { formatCurrency } from "@/lib/currency";
import { QR_VARIANT_SUFFIX } from "@/lib/review-platforms";
import ProductThumb from "@/components/admin/ProductThumb";

type Promo = {
  code: string;
  discount_rate: number;
  active: boolean;
  created_at: string;
  scope: { slug: string; variant: string }[];
};

type ProductOption = { slug: string; title: string; price: number; colors: string[] };
type ScopeEntry = { slug: string; variant: string };

// Review Card's NFC+QR option is a separate toggle at checkout, not a stored
// color, but it's still a distinct thing customers buy — mirror the same
// expansion used in Inventory so it can be scoped independently here too.
function managedVariantNames(slug: string, colors: string[]): string[] {
  if (slug !== "review-card") return colors;
  return colors.flatMap((c) => [c, `${c}${QR_VARIANT_SUFFIX}`]);
}

function ProductScopePicker({
  products,
  selected,
  discountPercent,
  onChange,
}: {
  products: ProductOption[];
  selected: ScopeEntry[];
  discountPercent: number;
  onChange: (next: ScopeEntry[]) => void;
}) {
  const [search, setSearch] = useState("");
  const discounted = discountPercent > 0 && discountPercent <= 100;
  const isSelected = (slug: string, variant: string) =>
    selected.some((s) => s.slug === slug && s.variant === variant);

  const toggleOne = (entry: ScopeEntry) => {
    onChange(
      isSelected(entry.slug, entry.variant)
        ? selected.filter((s) => !(s.slug === entry.slug && s.variant === entry.variant))
        : [...selected, entry]
    );
  };

  const query = search.trim().toLowerCase();
  const filteredProducts = products
    .map((p) => {
      const allVariants = p.colors.length > 0 ? managedVariantNames(p.slug, p.colors) : [""];
      const productMatches = !query || p.title.toLowerCase().includes(query);
      const variantNames = allVariants.filter(
        (v) => productMatches || (v || "whole product").toLowerCase().includes(query)
      );
      return { ...p, variantNames };
    })
    .filter((p) => p.variantNames.length > 0);

  const visibleEntries: ScopeEntry[] = filteredProducts.flatMap((p) =>
    p.variantNames.map((variant) => ({ slug: p.slug, variant }))
  );
  const allVisibleSelected =
    visibleEntries.length > 0 && visibleEntries.every((v) => isSelected(v.slug, v.variant));

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      onChange(
        selected.filter((s) => !visibleEntries.some((v) => v.slug === s.slug && v.variant === s.variant))
      );
    } else {
      const additions = visibleEntries.filter((v) => !isSelected(v.slug, v.variant));
      onChange([...selected, ...additions]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-black/50">
          Applies to <span className="font-normal">(leave all unchecked for every product)</span>
        </p>
        {visibleEntries.length > 0 && (
          <button
            type="button"
            onClick={toggleAllVisible}
            className="shrink-0 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold text-black transition-colors hover:border-black/30 hover:bg-black/5"
          >
            {allVisibleSelected ? "Remove all" : "Apply to all"}
          </button>
        )}
      </div>

      <div className="relative mt-1.5">
        <FiSearch className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-black/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or variants"
          className="w-full rounded-full border border-black/15 bg-white py-1.5 pr-3 pl-8 text-xs outline-none focus:border-black"
        />
      </div>

      <div className="mt-2 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
        {filteredProducts.length === 0 && (
          <p className="py-2 text-xs text-black/40">No products match &ldquo;{search}&rdquo;.</p>
        )}
        {filteredProducts.map((p) => {
          const afterPrice = discounted ? p.price * (1 - discountPercent / 100) : null;
          return (
            <div key={p.slug}>
              <p className="mb-1 text-xs font-semibold text-black/70">{p.title}</p>
              <div className="flex flex-col gap-1.5">
                {p.variantNames.map((variant) => {
                  const active = isSelected(p.slug, variant);
                  return (
                    <div
                      key={variant || "__whole__"}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleOne({ slug: p.slug, variant })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleOne({ slug: p.slug, variant });
                        }
                      }}
                      aria-pressed={active}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 ${
                        active ? "border-black bg-black/[0.03]" : "border-black/10 hover:border-black/25"
                      }`}
                    >
                      <ProductThumb
                        slug={p.slug}
                        variant={variant || (p.colors[0] ?? "")}
                        className="pointer-events-none w-10 shrink-0"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">
                        {variant || "Whole product"}
                      </span>
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
  const [scope, setScope] = useState<ScopeEntry[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editScope, setEditScope] = useState<ScopeEntry[]>([]);
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
      body: JSON.stringify({ code, discount_rate: rate, scope }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setCode("");
    setPercent("");
    setScope([]);
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
    setEditScope(promo.scope);
  };

  const saveScope = async (promo: Promo) => {
    setSavingScope(true);
    await fetch(`/api/admin/promos/${encodeURIComponent(promo.code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: editScope }),
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
            selected={scope}
            discountPercent={Number(percent)}
            onChange={setScope}
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
                  {promo.scope.length === 0
                    ? "All products"
                    : `${promo.scope.length} item${promo.scope.length === 1 ? "" : "s"}`}
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
                  onChange={setEditScope}
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
