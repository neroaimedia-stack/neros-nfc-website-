"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { PROMO_CODES } from "@/lib/promo-codes";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const discountRate = appliedCode ? PROMO_CODES[appliedCode] : 0;
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedCode(code);
      setPromoError("");
    } else {
      setAppliedCode(null);
      setPromoError("Invalid promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedCode(null);
    setPromoInput("");
    setPromoError("");
  };

  const checkoutHref = `mailto:herneros.ph@gmail.com?subject=Order%20Checkout${
    appliedCode ? `&body=Promo%20code%3A%20${appliedCode}` : ""
  }`;

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

      <div className="mt-8 border-t border-black/10 pt-6">
        <p className="text-sm font-semibold text-black">Promo code</p>
        {appliedCode ? (
          <div className="mt-3 flex items-center justify-between rounded-full border border-black/20 px-4 py-2.5">
            <span className="text-sm font-semibold text-black">
              {appliedCode} applied — {discountRate * 100}% off
            </span>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-xs text-black/40 underline hover:text-black"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyPromo();
                }
              }}
              placeholder="Enter code"
              className="w-full rounded-full border border-black/20 px-4 py-2.5 text-sm uppercase outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="shrink-0 rounded-full border border-black px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-60"
            >
              Apply
            </button>
          </div>
        )}
        {promoError && (
          <p className="mt-2 text-xs text-red-600">{promoError}</p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-black/60">Subtotal</span>
          <span className="text-sm font-semibold text-black">
            ₱{subtotal.toLocaleString()}
          </span>
        </div>
        {appliedCode && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-black/60">Discount</span>
            <span className="text-sm font-semibold text-black">
              −₱{discount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-black/60">Total</span>
          <span className="text-xl font-bold text-black">
            ₱{total.toLocaleString()}
          </span>
        </div>
      </div>

      <Link
        href={checkoutHref}
        className="mt-6 block rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Checkout
      </Link>
    </main>
  );
}
