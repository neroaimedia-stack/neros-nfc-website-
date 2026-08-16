"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, fromUSD } from "@/lib/currency";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const currency = useCurrency();
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const discount = subtotal * discountRate;
  const total = subtotal - discount;
  const monthlyTotal = items.reduce((sum, i) => sum + (i.monthlyFee || 0), 0);

  const display = (amountUSD: number) =>
    formatCurrency(fromUSD(amountUSD, currency), currency);

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setCheckingPromo(true);
    const { data } = await supabase
      .from("promo_codes")
      .select("discount_rate")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    setCheckingPromo(false);
    if (data) {
      setAppliedCode(code);
      setDiscountRate(Number(data.discount_rate));
      setPromoError("");
    } else {
      setAppliedCode(null);
      setDiscountRate(0);
      setPromoError("Invalid promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedCode(null);
    setDiscountRate(0);
    setPromoInput("");
    setPromoError("");
    setShowPromoInput(false);
  };

  const checkoutBody = [
    ...items.map((item) => {
      const lines = [`- ${item.title} (${item.color}) x${item.quantity}`];
      if (item.name) lines.push(`  Name: ${item.name}`);
      if (item.jobTitle) lines.push(`  Title: ${item.jobTitle}`);
      if (item.qrDestinationLink)
        lines.push(`  QR destination link: ${item.qrDestinationLink}`);
      if (item.nfcDestinationLink)
        lines.push(`  NFC destination link: ${item.nfcDestinationLink}`);
      if (item.monthlyFee)
        lines.push(`  Recurring: ${display(item.monthlyFee)}/month`);
      if (item.notes) lines.push(`  Notes: ${item.notes}`);
      return lines.join("\n");
    }),
    appliedCode ? `\nPromo code: ${appliedCode}` : "",
    monthlyTotal
      ? `\nRecurring total: ${display(monthlyTotal)}/month (billed separately)`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const checkoutHref = `mailto:herneros.ph@gmail.com?subject=Order%20Checkout&body=${encodeURIComponent(checkoutBody)}`;

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          subtotal,
          discount,
          total,
          promo_code: appliedCode,
          currency: "USD",
        })
        .select("id")
        .single();
      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((item) => ({
          order_id: order.id,
          product_slug: item.productSlug,
          title: item.title,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes ?? null,
          name: item.name ?? null,
          job_title: item.jobTitle ?? null,
          qr_destination_link: item.qrDestinationLink ?? null,
          nfc_destination_link: item.nfcDestinationLink ?? null,
          monthly_fee: item.monthlyFee ?? null,
        }))
      );
      if (itemsError) throw itemsError;

      clearCart();
      window.location.href = checkoutHref;
    } catch {
      setCheckoutError(
        "Something went wrong placing your order. Please try again."
      );
    } finally {
      setCheckingOut(false);
    }
  };

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
              {(item.name || item.jobTitle) && (
                <p className="mt-1 text-xs text-black/50">
                  {[item.name, item.jobTitle].filter(Boolean).join(" · ")}
                </p>
              )}
              {item.qrDestinationLink && (
                <p className="mt-1 max-w-xs truncate text-xs text-black/50">
                  QR links to: {item.qrDestinationLink}
                </p>
              )}
              {item.nfcDestinationLink && (
                <p className="mt-1 max-w-xs truncate text-xs text-black/50">
                  NFC links to: {item.nfcDestinationLink}
                </p>
              )}
              {item.monthlyFee && (
                <p className="mt-1 text-xs text-black/50">
                  + {display(item.monthlyFee)}/month (billed separately)
                </p>
              )}
              {item.notes && (
                <p className="mt-1 max-w-xs text-xs text-black/40 italic">
                  “{item.notes}”
                </p>
              )}
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
              <span className="w-20 text-right font-semibold text-black">
                {display(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-black/10 pt-6">
        {appliedCode ? (
          <>
            <p className="text-sm font-semibold text-black">Promo code</p>
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
          </>
        ) : showPromoInput ? (
          <>
            <p className="text-sm font-semibold text-black">Promo code</p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                autoFocus
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
                disabled={checkingPromo}
                className="shrink-0 rounded-full border border-black px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-60 disabled:opacity-40"
              >
                {checkingPromo ? "Checking…" : "Apply"}
              </button>
            </div>
            {promoError && (
              <p className="mt-2 text-xs text-red-600">{promoError}</p>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowPromoInput(true)}
            className="text-sm font-semibold text-black underline decoration-black/30 underline-offset-2 hover:decoration-black"
          >
            Have a promo code?
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-black/60">Subtotal</span>
          <span className="text-sm font-semibold text-black">
            {display(subtotal)}
          </span>
        </div>
        {appliedCode && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-black/60">Discount</span>
            <span className="text-sm font-semibold text-black">
              −{display(discount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-black/60">Total</span>
          <span className="text-xl font-bold text-black">
            {display(total)}
          </span>
        </div>
        {monthlyTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-black/60">
              + Recurring (billed separately)
            </span>
            <span className="text-sm font-semibold text-black">
              {display(monthlyTotal)}/month
            </span>
          </div>
        )}
      </div>

      {checkoutError && (
        <p className="mt-4 text-center text-xs text-red-600">
          {checkoutError}
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={checkingOut}
        className="mt-6 block w-full rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {checkingOut ? "Placing order…" : "Checkout"}
      </button>
    </main>
  );
}
