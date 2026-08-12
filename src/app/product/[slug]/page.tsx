"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FlippableCard from "@/components/FlippableCard";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { CARD_COLORS, DEFAULT_CARD_COLOR } from "@/lib/card-colors";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const product = products[params.slug];
  const { addItem } = useCart();
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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

  const handleAddToCart = () => {
    addItem({
      id: `${product.slug}-${color}`,
      productSlug: product.slug,
      title: product.title,
      color,
      price: product.price,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-16 md:grid-cols-2 md:items-start">
      <div className="rounded-2xl border border-black/10 bg-neutral-50 p-10">
        <FlippableCard className="mx-auto w-full max-w-sm" color={color} />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          {product.title}
        </h1>

        <div className="mt-4 flex items-center gap-3">
          {product.compareAtPrice && (
            <span className="text-lg text-black/40 line-through">
              ₱{product.compareAtPrice.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-bold text-black">
            ₱{product.price.toLocaleString()}
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

        <div className="mt-8 rounded-2xl border border-black/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-black/60">
              Select Finish
            </span>
            <span className="text-sm font-semibold text-black">{color}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {product.colors.map((c) => {
              const swatch = (CARD_COLORS[c] ?? CARD_COLORS[DEFAULT_CARD_COLOR]).swatch;
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
        </div>

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
            onClick={handleAddToCart}
            className="rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Buy it now
          </Link>
        </div>
      </div>
    </main>
  );
}
