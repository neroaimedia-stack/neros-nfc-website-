"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { formatCurrency } from "@/lib/currency";

type Product = {
  slug: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  colors: string[];
  track_stock: boolean;
  stock_quantity: number;
  allow_preorder: boolean;
  sort_order: number;
};

function ProductRow({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: (next: Product) => void;
}) {
  const [price, setPrice] = useState(String(product.price));
  const [colors, setColors] = useState(product.colors);
  const [newColor, setNewColor] = useState("");
  const [trackStock, setTrackStock] = useState(product.track_stock);
  const [stockQuantity, setStockQuantity] = useState(String(product.stock_quantity));
  const [allowPreorder, setAllowPreorder] = useState(product.allow_preorder);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const dirty =
    price !== String(product.price) ||
    JSON.stringify(colors) !== JSON.stringify(product.colors) ||
    trackStock !== product.track_stock ||
    stockQuantity !== String(product.stock_quantity) ||
    allowPreorder !== product.allow_preorder;

  const addColor = () => {
    const trimmed = newColor.trim();
    if (!trimmed || colors.includes(trimmed)) return;
    setColors([...colors, trimmed]);
    setNewColor("");
  };

  const removeColor = (c: string) => {
    setColors(colors.filter((x) => x !== c));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/admin/products/${product.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(price),
        colors,
        track_stock: trackStock,
        stock_quantity: Number(stockQuantity),
        allow_preorder: allowPreorder,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setSaved(true);
    onSaved({
      ...product,
      price: Number(price),
      colors,
      track_stock: trackStock,
      stock_quantity: Number(stockQuantity),
      allow_preorder: allowPreorder,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const outOfStock = trackStock && Number(stockQuantity) <= 0;

  return (
    <div className="rounded-2xl border border-black/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-black">{product.title}</p>
          <p className="text-xs text-black/40">{product.slug}</p>
        </div>
        {outOfStock && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              allowPreorder ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            }`}
          >
            {allowPreorder ? "Out of stock · pre-order on" : "Out of stock · blocked"}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-black" htmlFor={`price-${product.slug}`}>
            Price (USD)
          </label>
          <input
            id={`price-${product.slug}`}
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-black">Colors / variants</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {colors.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 rounded-full border border-black/15 py-1.5 pl-3 pr-2 text-xs font-medium text-black"
              >
                {c}
                <button
                  type="button"
                  onClick={() => removeColor(c)}
                  aria-label={`Remove ${c}`}
                  className="rounded-full p-0.5 text-black/40 hover:bg-black/10 hover:text-black"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addColor();
                }
              }}
              placeholder="Add a variant"
              className="h-10 min-w-0 flex-1 rounded-xl border border-black/15 px-3 text-sm outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={addColor}
              className="shrink-0 rounded-xl border border-black px-3 text-xs font-semibold text-black transition-opacity hover:opacity-60"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-black">
          <input
            type="checkbox"
            checked={trackStock}
            onChange={(e) => setTrackStock(e.target.checked)}
            className="h-4 w-4 accent-black"
          />
          Track stock
        </label>
        {trackStock && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-black" htmlFor={`stock-${product.slug}`}>
                Quantity
              </label>
              <input
                id={`stock-${product.slug}`}
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="h-9 w-24 rounded-xl border border-black/15 px-3 text-sm outline-none focus:border-black"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                checked={allowPreorder}
                onChange={(e) => setAllowPreorder(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Allow pre-order when out of stock
            </label>
          </>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-xs font-medium text-green-600">Saved ✓</span>}
        <span className="text-xs text-black/40">
          {formatCurrency(product.price, "USD")} current price
        </span>
      </div>
    </div>
  );
}

export default function InventoryManager() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (active) setProducts(data.products);
      });
    return () => {
      active = false;
    };
  }, []);

  if (products === null) {
    return <p className="text-sm text-black/40">Loading products…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {products.map((product) => (
        <ProductRow
          key={product.slug}
          product={product}
          onSaved={(next) =>
            setProducts((prev) =>
              prev ? prev.map((p) => (p.slug === next.slug ? next : p)) : prev
            )
          }
        />
      ))}
    </div>
  );
}
