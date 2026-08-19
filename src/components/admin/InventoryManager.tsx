"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FiCamera, FiPackage, FiSearch, FiTrash2 } from "react-icons/fi";
import { formatCurrency } from "@/lib/currency";
import { QR_VARIANT_SUFFIX } from "@/lib/review-platforms";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";
import ImageCropModal from "@/components/ImageCropModal";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-black">
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-black/15 transition-colors peer-checked:bg-black" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      {label}
    </label>
  );
}

function VariantThumb({
  slug,
  variant,
  imageOverride,
}: {
  slug: string;
  variant: string;
  imageOverride?: string | null;
}) {
  const className = "w-20 shrink-0";
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
        <FlippableCard shadow={false} reflection={false} personalized={false} className={className} />
      );
    default:
      if (imageOverride) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageOverride}
            alt={variant}
            className={`${className} aspect-square rounded-lg object-cover`}
          />
        );
      }
      return (
        <div className={`${className} flex aspect-square items-center justify-center rounded-lg border border-dashed border-black/15 text-black/25`}>
          <FiPackage className="h-6 w-6" />
        </div>
      );
  }
}

type VariantDetail = {
  description: string;
  price: string;
  imageUrl: string | null;
  stockQuantity: string;
};

const EMPTY_DETAIL: VariantDetail = { description: "", price: "", imageUrl: null, stockQuantity: "" };

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
    { description?: string; price?: number; image_url?: string; stock_quantity?: number }
  >;
};

// Review Card's NFC+QR option is a separate toggle at checkout, not a stored
// color — but it still needs its own manageable price/description/photo, so
// we derive an extra row per platform here for admin editing purposes only.
function managedVariantNames(slug: string, colors: string[]): string[] {
  if (slug !== "review-card") return colors;
  return colors.flatMap((c) => [c, `${c}${QR_VARIANT_SUFFIX}`]);
}

function detailsFromProduct(product: Product): Record<string, VariantDetail> {
  const map: Record<string, VariantDetail> = {};
  for (const name of managedVariantNames(product.slug, product.colors)) {
    const d = product.variant_details?.[name];
    map[name] = {
      description: d?.description ?? "",
      price: d?.price != null ? String(d.price) : "",
      imageUrl: d?.image_url ?? null,
      stockQuantity: d?.stock_quantity != null ? String(d.stock_quantity) : "",
    };
  }
  return map;
}

function VariantRow({
  slug,
  name,
  detail,
  derived,
  trackStock,
  onChange,
  onRemove,
}: {
  slug: string;
  name: string;
  detail: VariantDetail;
  derived: boolean;
  trackStock: boolean;
  onChange: (next: VariantDetail) => void;
  onRemove?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const showPictureUpload = slug !== "business-card";

  const closeCropper = () => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    setUploadError("");
    setPendingImageSrc(URL.createObjectURL(file));
  };

  const handleCropConfirm = async (blob: Blob) => {
    closeCropper();
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", blob, "photo.jpg");
    formData.append("slug", slug);
    formData.append("variant", name);
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
    onChange({ ...detail, imageUrl: data.url });
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-start ${
        derived ? "border-black/5 bg-black/[0.015]" : "border-black/10 bg-white"
      }`}
    >
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        {showPictureUpload ? (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label={detail.imageUrl ? `Change photo for ${name}` : `Add photo for ${name}`}
              className="group relative block overflow-hidden rounded-lg transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:opacity-60"
            >
              <VariantThumb slug={slug} variant={name} imageOverride={detail.imageUrl} />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
                {uploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <FiCamera className="h-4 w-4 text-white" />
                )}
              </span>
              <span className="pointer-events-none absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-white shadow">
                <FiCamera className="h-2.5 w-2.5" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {detail.imageUrl && (
              <button
                type="button"
                onClick={() => onChange({ ...detail, imageUrl: null })}
                className="text-[11px] font-medium text-black/40 hover:text-red-600"
              >
                Remove
              </button>
            )}
            {uploadError && <p className="max-w-20 text-center text-[10px] text-red-600">{uploadError}</p>}
            {pendingImageSrc && (
              <ImageCropModal
                imageSrc={pendingImageSrc}
                aspect={1}
                onCancel={closeCropper}
                onConfirm={handleCropConfirm}
              />
            )}
          </>
        ) : (
          <VariantThumb slug={slug} variant={name} imageOverride={detail.imageUrl} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-black">{name}</span>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${name}`}
              className="shrink-0 rounded-full p-1 text-black/40 hover:bg-red-50 hover:text-red-600"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className={`grid gap-2 ${trackStock ? "sm:grid-cols-[7rem_7rem_1fr]" : "sm:grid-cols-[7rem_1fr]"}`}>
          <div>
            <label className="text-xs text-black/50">Price override</label>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Base price"
              value={detail.price}
              onChange={(e) => onChange({ ...detail, price: e.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-black/15 px-2.5 text-sm outline-none focus:border-black"
            />
          </div>
          {trackStock && (
            <div>
              <label className="text-xs text-black/50">Stock</label>
              <input
                type="number"
                min={0}
                step="1"
                placeholder="Qty"
                value={detail.stockQuantity}
                onChange={(e) => onChange({ ...detail, stockQuantity: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-black/15 px-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-black/50">Description</label>
            <input
              type="text"
              placeholder="Optional note shown to customers"
              value={detail.description}
              onChange={(e) => onChange({ ...detail, description: e.target.value })}
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
  onDeleted,
}: {
  product: Product;
  onSaved: (next: Product) => void;
  onDeleted: () => void;
}) {
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product.compare_at_price != null ? String(product.compare_at_price) : ""
  );
  const [description, setDescription] = useState(product.description);
  const [colors, setColors] = useState<string[]>(product.colors);
  const [details, setDetails] = useState<Record<string, VariantDetail>>(() =>
    detailsFromProduct(product)
  );
  const [newVariantName, setNewVariantName] = useState("");
  const [trackStock, setTrackStock] = useState(product.track_stock);
  const [stockQuantity, setStockQuantity] = useState(String(product.stock_quantity));
  const [allowPreorder, setAllowPreorder] = useState(product.allow_preorder);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const managedNames = managedVariantNames(product.slug, colors);
  const getDetail = (name: string) => details[name] ?? EMPTY_DETAIL;
  const updateDetail = (name: string, next: VariantDetail) =>
    setDetails((prev) => ({ ...prev, [name]: next }));

  const originalDetails = detailsFromProduct(product);
  const currentManaged = Object.fromEntries(managedNames.map((n) => [n, getDetail(n)]));
  const originalManaged = Object.fromEntries(
    managedVariantNames(product.slug, product.colors).map((n) => [n, originalDetails[n] ?? EMPTY_DETAIL])
  );

  const dirty =
    price !== String(product.price) ||
    compareAtPrice !== (product.compare_at_price != null ? String(product.compare_at_price) : "") ||
    description !== product.description ||
    JSON.stringify(colors) !== JSON.stringify(product.colors) ||
    JSON.stringify(currentManaged) !== JSON.stringify(originalManaged) ||
    trackStock !== product.track_stock ||
    stockQuantity !== String(product.stock_quantity) ||
    allowPreorder !== product.allow_preorder;

  const addVariant = () => {
    const trimmed = newVariantName.trim();
    if (!trimmed || colors.includes(trimmed)) return;
    setColors([...colors, trimmed]);
    setNewVariantName("");
  };

  const removeVariant = (name: string) => {
    setColors((prev) => prev.filter((c) => c !== name));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    const variantDetails: Record<
      string,
      { description?: string; price?: number; image_url?: string; stock_quantity?: number }
    > = {};
    for (const name of managedNames) {
      const d = getDetail(name);
      const entry: { description?: string; price?: number; image_url?: string; stock_quantity?: number } = {};
      if (d.description.trim()) entry.description = d.description.trim();
      if (d.price.trim() && !Number.isNaN(Number(d.price))) entry.price = Number(d.price);
      if (d.imageUrl) entry.image_url = d.imageUrl;
      if (trackStock && d.stockQuantity.trim() && !Number.isNaN(Number(d.stockQuantity)))
        entry.stock_quantity = Number(d.stockQuantity);
      if (Object.keys(entry).length > 0) variantDetails[name] = entry;
    }

    const compareAtPriceValue =
      compareAtPrice.trim() && !Number.isNaN(Number(compareAtPrice)) ? Number(compareAtPrice) : null;

    const res = await fetch(`/api/admin/products/${product.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(price),
        compare_at_price: compareAtPriceValue,
        description,
        colors,
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
      compare_at_price: compareAtPriceValue,
      description,
      colors,
      track_stock: trackStock,
      stock_quantity: Number(stockQuantity),
      allow_preorder: allowPreorder,
      variant_details: variantDetails,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteProduct = async () => {
    if (!confirm(`Delete "${product.title}"? This can't be undone.`)) return;
    setDeleting(true);
    setDeleteError("");
    const res = await fetch(`/api/admin/products/${product.slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setDeleting(false);
      setDeleteError(data.error ?? "Something went wrong.");
      return;
    }
    onDeleted();
  };

  const outOfStock = trackStock && Number(stockQuantity) <= 0;

  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-black">{product.title}</p>
          <p className="text-xs text-black/40">{product.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {outOfStock && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                allowPreorder ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              }`}
            >
              {allowPreorder ? "Out of stock · pre-order on" : "Out of stock · blocked"}
            </span>
          )}
          <button
            type="button"
            onClick={deleteProduct}
            disabled={deleting}
            aria-label={`Delete ${product.title}`}
            className="rounded-full p-2 text-black/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {deleteError && <p className="mt-2 text-xs text-red-600">{deleteError}</p>}

      <div className="mt-4">
        <label className="text-xs font-medium text-black/60" htmlFor={`description-${product.slug}`}>
          Description
        </label>
        <textarea
          id={`description-${product.slug}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Shown on the product page"
          className="mt-1 w-full resize-none rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
        />
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

        <div className="w-32">
          <label className="text-xs font-medium text-black/60" htmlFor={`compare-price-${product.slug}`}>
            Compare-at price
          </label>
          <input
            id={`compare-price-${product.slug}`}
            type="number"
            min={0}
            step="0.01"
            placeholder="None"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-black/15 px-3 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="pb-2.5">
          <Toggle checked={trackStock} onChange={setTrackStock} label="Track stock" />
        </div>

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
            <div className="pb-2.5">
              <Toggle
                checked={allowPreorder}
                onChange={setAllowPreorder}
                label="Allow pre-order when out of stock"
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-black">Variants</p>
        <div className="mt-2 flex flex-col gap-2">
          {colors.map((name) => (
            <div key={name} className="flex flex-col gap-2">
              <VariantRow
                slug={product.slug}
                name={name}
                detail={getDetail(name)}
                derived={false}
                trackStock={trackStock}
                onChange={(next) => updateDetail(name, next)}
                onRemove={() => removeVariant(name)}
              />
              {product.slug === "review-card" && (
                <VariantRow
                  slug={product.slug}
                  name={`${name}${QR_VARIANT_SUFFIX}`}
                  detail={getDetail(`${name}${QR_VARIANT_SUFFIX}`)}
                  derived
                  trackStock={trackStock}
                  onChange={(next) => updateDetail(`${name}${QR_VARIANT_SUFFIX}`, next)}
                />
              )}
            </div>
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

function AddProductForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, price: Number(price), description }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setTitle("");
    setPrice("");
    setDescription("");
    onCreated();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white shadow-sm p-4">
      <p className="text-sm font-semibold text-black">Add product</p>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Product title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="min-w-0 flex-1 rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Price (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-32 rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
        />
      </div>
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="resize-none rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {saving ? "Adding…" : "+ Add product"}
      </button>
      <p className="text-xs text-black/40">
        New products use a generic personalized-card checkout flow and won&apos;t appear on the
        homepage automatically — you&apos;ll need a direct link to /product/[slug] until it&apos;s
        added there.
      </p>
    </form>
  );
}

export default function InventoryManager() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products));
  };

  useEffect(() => {
    load();
  }, []);

  const query = search.trim().toLowerCase();
  const filteredProducts = products?.filter(
    (p) => !query || p.title.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query)
  );

  return (
    <div className="flex flex-col gap-4">
      <AddProductForm onCreated={load} />

      {products !== null && products.length > 0 && (
        <div className="relative">
          <FiSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or slug"
            className="w-full rounded-full border border-black/15 bg-white py-2 pr-4 pl-9 text-sm outline-none focus:border-black"
          />
        </div>
      )}

      {products === null && <p className="text-sm text-black/40">Loading products…</p>}
      {products !== null && filteredProducts?.length === 0 && (
        <p className="text-sm text-black/40">No products match &ldquo;{search}&rdquo;.</p>
      )}
      {filteredProducts?.map((product) => (
        <ProductRow
          key={product.slug}
          product={product}
          onSaved={(next) =>
            setProducts((prev) =>
              prev ? prev.map((p) => (p.slug === next.slug ? next : p)) : prev
            )
          }
          onDeleted={() =>
            setProducts((prev) => (prev ? prev.filter((p) => p.slug !== product.slug) : prev))
          }
        />
      ))}
    </div>
  );
}
