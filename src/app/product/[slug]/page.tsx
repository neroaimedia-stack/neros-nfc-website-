"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { CARD_COLORS, DEFAULT_CARD_COLOR } from "@/lib/card-colors";
import { REVIEW_PLATFORMS, QR_VARIANT_SUFFIX } from "@/lib/review-platforms";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, fromUSD, toUSD } from "@/lib/currency";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const product = products[params.slug];
  const isReview = product?.slug === "review-card";
  const { addItem } = useCart();
  const currency = useCurrency();
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [hasQR, setHasQR] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [qrLink, setQrLink] = useState("");
  const [nfcLink, setNfcLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [added, setAdded] = useState(false);
  const variant = hasQR && isReview ? `${color}${QR_VARIANT_SUFFIX}` : color;
  const otherProducts = Object.values(products).filter(
    (p) => p.slug !== params.slug
  );

  if (!product) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-black">Product not found</h1>
        <Link
          href="/#buy"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Back to shop
        </Link>
      </main>
    );
  }

  const priceUSD = toUSD(product.price, product.currency);
  const compareAtPriceUSD = product.compareAtPrice
    ? toUSD(product.compareAtPrice, product.currency)
    : undefined;
  const displayPrice = formatCurrency(fromUSD(priceUSD, currency), currency);
  const displayCompareAtPrice = compareAtPriceUSD
    ? formatCurrency(fromUSD(compareAtPriceUSD, currency), currency)
    : undefined;

  const handleAddToCart = () => {
    if (isReview && hasQR && !qrLink.trim()) {
      setLinkError("Please provide a destination link for the QR code.");
      return false;
    }
    setLinkError("");
    addItem({
      id: `${product.slug}-${variant}`,
      productSlug: product.slug,
      title: product.title,
      color: variant,
      price: priceUSD,
      quantity,
      notes: notes.trim() || undefined,
      name: name.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      qrDestinationLink: isReview && hasQR ? qrLink.trim() || undefined : undefined,
      nfcDestinationLink: isReview ? nfcLink.trim() || undefined : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    return true;
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl border border-black/10 bg-neutral-50 p-8 lg:sticky lg:top-24">
          {isReview ? (
            <ReviewCardMock
              className="mx-auto w-[400px] max-w-full"
              platform={variant}
            />
          ) : (
            <FlippableCard
              className="mx-auto w-[400px] max-w-full"
              color={color}
              reflection={false}
              name={name.trim() || undefined}
              jobTitle={jobTitle.trim() || undefined}
            />
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            {displayCompareAtPrice && (
              <span className="text-lg text-black/40 line-through">
                {displayCompareAtPrice}
              </span>
            )}
            <span className="text-2xl font-bold text-black">
              {displayPrice}
            </span>
            {product.compareAtPrice && (
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                Sale
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-black/60 underline decoration-black/30 underline-offset-2">
            Shipping calculated at checkout.
          </p>

          <p className="mt-5 text-sm leading-relaxed text-black/70">
            {product.description}
          </p>

          <div className="mt-8 rounded-2xl border border-black/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                {isReview ? "Select Platform" : "Select Finish"}
              </span>
              <span className="text-sm font-semibold text-black">{color}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {product.colors.map((c) => {
                const swatch = isReview
                  ? REVIEW_PLATFORMS[c]?.background
                  : (CARD_COLORS[c] ?? CARD_COLORS[DEFAULT_CARD_COLOR]).swatch;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={c}
                    aria-pressed={color === c}
                    className={`h-8 w-8 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-black ring-offset-2"
                        : "ring-1 ring-black/10 hover:ring-black/40"
                    }`}
                    style={{ background: swatch }}
                  />
                );
              })}
            </div>

            {isReview && (
              <>
                <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    Format
                  </span>
                  <span className="text-sm font-semibold text-black">
                    {hasQR ? "NFC + QR Code" : "NFC Only"}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  {[
                    { label: "NFC Only", value: false },
                    { label: "NFC + QR Code", value: true },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setHasQR(option.value)}
                      aria-pressed={hasQR === option.value}
                      className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                        hasQR === option.value
                          ? "border-black bg-black text-white"
                          : "border-black/15 text-black hover:border-black/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {hasQR && (
                  <div className="mt-5 border-t border-black/10 pt-4">
                    <label
                      htmlFor="qr-link"
                      className="text-xs font-semibold uppercase tracking-wide text-black/60"
                    >
                      QR code destination link{" "}
                      <span className="font-normal normal-case text-black/40">
                        (required)
                      </span>
                    </label>
                    <input
                      id="qr-link"
                      type="url"
                      value={qrLink}
                      onChange={(e) => {
                        setQrLink(e.target.value);
                        if (linkError) setLinkError("");
                      }}
                      placeholder="https://..."
                      className={`mt-2 w-full rounded-full border px-4 py-2.5 text-sm outline-none ${
                        linkError
                          ? "border-red-500 focus:border-red-500"
                          : "border-black/15 focus:border-black"
                      }`}
                    />
                    {linkError && (
                      <p className="mt-2 text-xs text-red-600">{linkError}</p>
                    )}
                  </div>
                )}

                <div
                  className={`mt-5 pt-4 ${hasQR ? "" : "border-t border-black/10"}`}
                >
                  <label
                    htmlFor="nfc-link"
                    className="text-xs font-semibold uppercase tracking-wide text-black/60"
                  >
                    NFC destination link{" "}
                    <span className="font-normal normal-case text-black/40">
                      (optional — leave blank to set up later)
                    </span>
                  </label>
                  <input
                    id="nfc-link"
                    type="url"
                    value={nfcLink}
                    onChange={(e) => setNfcLink(e.target.value)}
                    placeholder="https://..."
                    className="mt-2 w-full rounded-full border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>
              </>
            )}
          </div>

          {!isReview && (
            <div className="mt-8 rounded-2xl border border-black/10 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
                Personalize your card
              </span>
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <label htmlFor="card-name" className="text-xs text-black/50">
                    Name
                  </label>
                  <input
                    id="card-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hernero Cruz"
                    className="mt-1 w-full rounded-full border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label htmlFor="card-title" className="text-xs text-black/50">
                    Title
                  </label>
                  <input
                    id="card-title"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. CEO & Founder"
                    className="mt-1 w-full rounded-full border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm font-semibold text-black">Quantity</p>
            <div className="mt-3 inline-flex items-center rounded-full border border-black/20">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-lg text-black"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold text-black">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-lg text-black"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8">
            <label
              htmlFor="purchase-notes"
              className="text-sm font-semibold text-black"
            >
              Purchase notes{" "}
              <span className="font-normal text-black/40">(optional)</span>
            </label>
            <textarea
              id="purchase-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests? e.g. custom text, rush order, specific link to use..."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-60"
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
            <Link
              href="/cart"
              onClick={(e) => {
                if (!handleAddToCart()) e.preventDefault();
              }}
              className="rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Buy it now
            </Link>
          </div>
        </div>
      </div>

      {otherProducts.length > 0 && (
        <div className="mt-16 border-t border-black/10 pt-12">
          <h2 className="text-xl font-bold text-black">
            Check out other products
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {otherProducts.map((p) => {
              const otherPriceUSD = toUSD(p.price, p.currency);
              const otherDisplayPrice = formatCurrency(
                fromUSD(otherPriceUSD, currency),
                currency
              );
              return (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-black/10 p-4 transition-opacity hover:opacity-70"
                >
                  <div className="w-20 shrink-0">
                    {p.slug === "review-card" ? (
                      <ReviewCardMock shadow={false} />
                    ) : (
                      <FlippableCard shadow={false} reflection={false} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-black">{p.title}</p>
                    <p className="mt-1 text-sm text-black/60">
                      {otherDisplayPrice}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
