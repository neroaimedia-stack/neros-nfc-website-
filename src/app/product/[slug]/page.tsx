"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CardFace from "@/components/CardFace";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

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
        <CardFace className="mx-auto w-full max-w-sm" />
        <p className="mt-6 text-center text-sm font-bold uppercase tracking-wide text-black">
          {color}
        </p>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-black">{product.title}</h1>

        <div className="mt-4 flex items-center gap-3">
          {product.compareAtPrice && (
            <span className="text-lg text-black/40 line-through">
              {product.compareAtPrice.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-bold text-black">
            {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              Sale
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-black/50 underline decoration-black/30 underline-offset-2">
          Shipping calculated at checkout.
        </p>

        <div className="mt-8">
          <p className="text-sm font-medium text-black">Card Color</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  color === c
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-black hover:border-black"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium text-black">Quantity</p>
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
