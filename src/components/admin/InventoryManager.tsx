"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";
import { formatCurrency } from "@/lib/currency";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";

function VariantThumb({
  slug,
  variant,
  imageOverride,
}: {
  slug: string;
  variant: string;
  imageOverride?: string | null;
}) {
  const className = "w-16 shrink-0";
  switch (slug) {
    case "review-card":
      return (
        <ReviewCardMock
          platform={variant}
          shadow={false}
          className={className}
          imageOverride={imageOverride}
        />
      );
    case "wifi-card":
      return (
        <WifiCardMock
          format={variant}
          shadow={false}
          className={className}
          imageOverride={imageOverride}
        />
      );
    case "order-card":
      return (
        <OrderCardMock
          format={variant}
          shadow={false}
          className={className}
          imageOverride={imageOverride}
        />
      );
    case "business-card":
      return (
        <FlippableCard
          shadow={false}
          reflection={false}
          personalized={false}
          className={className}
        />
      );
    default:
      return null;
  }
}

type VariantDraft = {
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
};

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
  variant_details: Record<
    string,
    { description?: string; price?: number; image_url?: string }
  >;
};

function variantsFromProduct(product: Product): VariantDraft[] {
  return product.colors.map((name) => {
    const detail = product.variant_details?.[name];
    return {
      name,
      description: detail?.description ?? "",
      price: detail?.price != null ? String(detail.price) : "",
      imageUrl: detail?.image_url ?? null,
    };
  });
}

function VariantRow({
  slug,
  variant,
  onChange,
  onRemove,
}: {
  slug: string;
  variant: VariantDraft;
  onChange: (next: VariantDraft) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const showPicture = slug !== "business-card";

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    formData.append("variant", variant.name);
    const res = await fetch("/api/admin/products/upload-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setUploadError(data.error ?? "Upload failed.");
      return;
    }
    onChange({ ...variant, imageUrl: data.url });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-3 sm:flex-row">
      {showPicture && (
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <VariantThumb slug={slug} variant={variant.name} imageOverride={variant.imageUrl} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 text-[11px] font-medium text-black/50 hover:text-black disabled:opacity-40"
          >
            <FiImage className="h-3 w-3" />
            {uploading ? "Uploading…" : variant.imageUrl ? "Change photo" : "Add photo"}
          </button>
          {variant.imageUrl && (
            <button
              type="button"
              onClick={() => onChange({ ...variant, imageUrl: null })}
              className="text-[11px] text-red-500 hover:text-red-700"
            >
              Remove photo
            </button>
          )}
          {uploadError && <p className="max-w-16 text-center text-[10px] text-red-600">{uploadError}</p>}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-black">{variant.name}</span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${variant.name}`}
            className="shrink-0 rounded-full p-1 text-black/40 hover:bg-red-50 hover:text-red-600"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[7rem_1fr]">
          <div>
            <label className="text-xs text-black/50">Price override</label>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Base price"
              value={variant.price}
              onChange={(e) => onChange({ ...variant, price: e.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-black/15 px-2.5 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-xs text-black/50">Description</label>
            <input
              type="text"
              placeholder="Optional note shown to customers"
              value={variant.description}
              onChange={(e) => onChange({ ...variant, description: e.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-black/15 px-2.5 text-sm outline-none focus:border-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: (next: Product) => void;
}) {
  const [price, setPrice] = useState(String(product.price));
  const [variants, setVariants] = useState<VariantDraft[]>(() => variantsFromProduct(product));
  const [newVariantName, setNewVariantName] = useState("");
  const [trackStock, setTrackStock] = useState(product.track_stock);
  const [stockQuantity, setStockQuantity] = useState(String(product.stock_quantity));
  const [allowPreorder, setAllowPreorder] = useState(product.allow_preorder);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const originalVariants = variantsFromProduct(product);
  const dirty =
    price !== String(product.price) ||
    JSON.stringify(variants) !== JSON.stringify(originalVariants) ||
    trackStock !== product.track_stock ||
    stockQuantity !== String(product.stock_quantity) ||
    allowPreorder !== product.allow_preorder;

  const updateVariant = (index: number, next: VariantDraft) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? next : v)));
  };

  const addVariant = () => {
    const trimmed = newVariantName.trim();
    if (!trimmed || variants.some((v) => v.name === trimmed)) return;
    setVariants([...variants, { name: trimmed, description: "", price: "", imageUrl: null }]);
    setNewVariantName("");
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    const variantDetails: Record<string, { description?: string; price?: number; image_url?: string }> = {};
    for (const v of variants) {
      const entry: { description?: string; price?: number; image_url?: string } = {};
      if (v.description.trim()) entry.description = v.description.trim();
      if (v.price.trim() && !Number.isNaN(Number(v.price))) entry.price = Number(v.price);
      if (v.imageUrl) entry.image_url = v.imageUrl;
      if (Object.keys(entry).length > 0) variantDetails[v.name] = entry;
    }

    const res = await fetch(`/api/admin/products/${product.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(price),
        colors: variants.map((v) => v.name),
        track_stock: trackStock,
        stock_quantity: Number(stockQuantity),
        allow_preorder: allowPreorder,
        variant_details: variantDetails,
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
      colors: variants.map((v) => v.name),
      track_stock: trackStock,
      stock_quantity: Number(stockQuantity),
      allow_preorder: allowPreorder,
      variant_details: variantDetails,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const outOfStock = trackStock && Number(stockQuantity) <= 0;

  return (
    <div className="rounded-2xl border border-black/10 p-5">
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

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-black/10 pb-4">
        <div className="w-32">
          <label className="text-xs font-medium text-black/60" htmlFor={`price-${product.slug}`}>
            Base price (USD)
          </label>
          <input
            id={`price-${product.slug}`}
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-black/15 px-3 text-sm outline-none focus:border-black"
          />
        </div>

        <label className="flex items-center gap-2 pb-2.5 text-sm text-black">
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
            <div className="w-24">
              <label className="text-xs font-medium text-black/60" htmlFor={`stock-${product.slug}`}>
                Quantity
              </label>
              <input
                id={`stock-${product.slug}`}
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-black/15 px-3 text-sm outline-none focus:border-black"
              />
            </div>
            <label className="flex items-center gap-2 pb-2.5 text-sm text-black">
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

      <div className="mt-4">
        <p className="text-sm font-medium text-black">Variants</p>
        <div className="mt-2 flex flex-col gap-2">
          {variants.map((variant, i) => (
            <VariantRow
              key={variant.name}
              slug={product.slug}
              variant={variant}
              onChange={(next) => updateVariant(i, next)}
              onRemove={() => removeVariant(i)}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newVariantName}
            onChange={(e) => setNewVariantName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addVariant();
              }
            }}
            placeholder="Add a variant"
            className="h-10 min-w-0 flex-1 rounded-xl border border-black/15 px-3 text-sm outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={addVariant}
            className="shrink-0 rounded-xl border border-black px-4 text-xs font-semibold text-black transition-opacity hover:opacity-60"
          >
            Add
          </button>
        </div>
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
