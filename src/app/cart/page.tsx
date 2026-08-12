"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-black">Your cart is empty</h1>
        <Link
          href="/#buy"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Browse cards
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-black">Your cart</h1>
      <div className="mt-8 flex flex-col divide-y divide-black/10">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-5">
            <div>
              <p className="font-semibold text-black">{item.title}</p>
              <p className="text-sm text-black/50">{item.color}</p>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="mt-2 text-xs text-black/40 underline hover:text-black"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-black/20">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-1.5 text-black"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-black">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1.5 text-black"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="w-16 text-right font-semibold text-black">
                ₱{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
        <span className="text-sm text-black/60">Subtotal</span>
        <span className="text-xl font-bold text-black">
          ₱{subtotal.toLocaleString()}
        </span>
      </div>

      <Link
        href="mailto:herneros.ph@gmail.com?subject=Order%20Checkout"
        className="mt-6 block rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Checkout
      </Link>
    </main>
  );
}
