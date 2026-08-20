"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, fromUSD } from "@/lib/currency";
import AddressFields from "@/components/AddressFields";
import {
  EMPTY_ADDRESS,
  formatAddress,
  isAddressComplete,
  type ShippingAddress,
} from "@/lib/shipping";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const currency = useCurrency();
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState(0);
  const [promoScope, setPromoScope] = useState<{ slug: string; variant: string }[]>([]);
  const [promoError, setPromoError] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [shippingNote, setShippingNote] = useState("");
  const [itemOverridesOn, setItemOverridesOn] = useState<Record<string, boolean>>({});
  const [itemAddresses, setItemAddresses] = useState<Record<string, ShippingAddress>>({});

  const itemAddress = (id: string) => itemAddresses[id] ?? EMPTY_ADDRESS;
  const setItemAddress = (id: string, next: ShippingAddress) =>
    setItemAddresses((prev) => ({ ...prev, [id]: next }));
  const toggleItemOverride = (id: string) =>
    setItemOverridesOn((prev) => ({ ...prev, [id]: !prev[id] }));

  const itemMatchesScope = (item: (typeof items)[number]) =>
    promoScope.some(
      (s) => s.slug === item.productSlug && (s.variant === "" || s.variant === item.color)
    );
  const discountableSubtotal =
    promoScope.length === 0
      ? subtotal
      : items.filter(itemMatchesScope).reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = discountableSubtotal * discountRate;
  const total = subtotal - discount;
  const monthlyTotal = items.reduce((sum, i) => sum + (i.monthlyFee || 0), 0);
  const promoAppliesToNothing =
    appliedCode !== null && promoScope.length > 0 && discountableSubtotal === 0;

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
    if (!data) {
      setCheckingPromo(false);
      setAppliedCode(null);
      setDiscountRate(0);
      setPromoScope([]);
      setPromoError("Invalid promo code");
      return;
    }
    const { data: scopeRows } = await supabase
      .from("promo_code_products")
      .select("product_slug, variant")
      .eq("promo_code", code);
    setCheckingPromo(false);
    setAppliedCode(code);
    setDiscountRate(Number(data.discount_rate));
    setPromoScope((scopeRows ?? []).map((r) => ({ slug: r.product_slug, variant: r.variant })));
    setPromoError("");
  };

  const handleRemovePromo = () => {
    setAppliedCode(null);
    setDiscountRate(0);
    setPromoScope([]);
    setPromoInput("");
    setPromoError("");
    setShowPromoInput(false);
  };

  const checkoutBody = [
    `Recipient: ${customerName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Shipping address: ${formatAddress(shippingAddress)}`,
    shippingNote ? `Delivery note: ${shippingNote}` : "",
    "",
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
      if (itemOverridesOn[item.id])
        lines.push(`  Ships to: ${formatAddress(itemAddress(item.id))}`);
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
    if (!customerName.trim() || !email.trim() || !phone.trim()) {
      setCheckoutError("Please fill in your name, email, and phone number.");
      return;
    }
    if (!isAddressComplete(shippingAddress)) {
      setCheckoutError("Please fill in your country, city, and street address.");
      return;
    }
    const incompleteOverride = items.find(
      (item) => itemOverridesOn[item.id] && !isAddressComplete(itemAddress(item.id))
    );
    if (incompleteOverride) {
      setCheckoutError(
        `Please finish the custom shipping address for "${incompleteOverride.title}", or turn it off.`
      );
      return;
    }
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
          customer_name: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shipping_country: shippingAddress.country.trim(),
          shipping_region: shippingAddress.region.trim(),
          shipping_province: shippingAddress.province.trim() || null,
          shipping_city: shippingAddress.city.trim(),
          shipping_barangay: shippingAddress.barangay.trim() || null,
          shipping_house_no: shippingAddress.houseNo.trim() || null,
          shipping_street: shippingAddress.street.trim(),
          shipping_postal_code: shippingAddress.postalCode.trim(),
          shipping_note: shippingNote.trim() || null,
        })
        .select("id")
        .single();
      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((item) => {
          const override = itemOverridesOn[item.id] ? itemAddress(item.id) : null;
          return {
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
            ship_country: override?.country.trim() || null,
            ship_region: override?.region.trim() || null,
            ship_province: override?.province.trim() || null,
            ship_city: override?.city.trim() || null,
            ship_barangay: override?.barangay.trim() || null,
            ship_house_no: override?.houseNo.trim() || null,
            ship_street: override?.street.trim() || null,
            ship_postal_code: override?.postalCode.trim() || null,
          };
        })
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
          <div key={item.id} className="py-5">
          <div className="flex items-center justify-between">
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

          {items.length > 1 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => toggleItemOverride(item.id)}
                className="text-xs font-semibold text-black underline decoration-black/30 underline-offset-2 hover:decoration-black"
              >
                {itemOverridesOn[item.id]
                  ? "Ship to the address above instead"
                  : "Ship this item to a different address"}
              </button>
              {itemOverridesOn[item.id] && (
                <div className="mt-3 rounded-xl bg-black/[0.03] p-3">
                  <AddressFields
                    idPrefix={`item-${item.id}`}
                    value={itemAddress(item.id)}
                    onChange={(next) => setItemAddress(item.id, next)}
                  />
                </div>
              )}
            </div>
          )}
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
            {promoAppliesToNothing && (
              <p className="mt-2 text-xs text-amber-600">
                This code doesn&apos;t apply to any items currently in your cart.
              </p>
            )}
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

      <div className="mt-6 border-t border-black/10 pt-6">
        <p className="text-sm font-semibold text-black">Contact info</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            className="rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            autoComplete="tel"
            className="rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            className="rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black sm:col-span-2"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-black/10 pt-6">
        <p className="text-sm font-semibold text-black">Shipping address</p>
        <p className="mt-1 text-xs text-black/40">
          {items.length > 1
            ? "Applies to every item, unless you set a different address for one below."
            : "Where should we send your order?"}
        </p>
        <p className="mt-2 rounded-lg bg-black/[0.03] px-3 py-2 text-xs text-black/50">
          We currently ship within the Philippines only. Ordering internationally or in
          bulk?{" "}
          <a
            href="mailto:herneros.ph@gmail.com?subject=International%2FBulk%20Order"
            className="font-semibold text-black underline underline-offset-2 hover:decoration-black"
          >
            Email us at herneros.ph@gmail.com
          </a>{" "}
          to arrange it.
        </p>
        <div className="mt-3">
          <AddressFields
            idPrefix="default"
            value={shippingAddress}
            onChange={setShippingAddress}
          />
        </div>
        <textarea
          value={shippingNote}
          onChange={(e) => setShippingNote(e.target.value)}
          placeholder="Delivery note (optional) — gate code, landmark, preferred time…"
          rows={2}
          className="mt-3 w-full resize-none rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black"
        />
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
