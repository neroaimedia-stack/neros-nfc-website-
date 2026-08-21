"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheck, FiUpload } from "react-icons/fi";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, fromUSD } from "@/lib/currency";
import { computeTotals } from "@/lib/promo";
import AddressFields from "@/components/AddressFields";
import {
  EMPTY_ADDRESS,
  formatAddress,
  isAddressComplete,
  type ShippingAddress,
} from "@/lib/shipping";

const STEPS = ["Contact", "Shipping", "Payment", "Confirm"] as const;

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <p className="text-sm text-black/40">Loading…</p>
        </main>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { items: cartItems, removeItems, clearCart, discountRate, promoScope, appliedCode } =
    useCart();
  const currency = useCurrency();

  const idsParam = searchParams.get("items");
  const selectedIds = idsParam ? idsParam.split(",").filter(Boolean) : null;
  const items = selectedIds
    ? cartItems.filter((i) => selectedIds.includes(i.id))
    : cartItems;
  const isPartial = selectedIds !== null;

  const checkoutPath = `/checkout${idsParam ? `?items=${idsParam}` : ""}`;

  const redirectedRef = useRef(false);
  useEffect(() => {
    if (items.length === 0 && !redirectedRef.current) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/account?next=${encodeURIComponent(checkoutPath)}`);
    }
  }, [authLoading, user, checkoutPath, router]);

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Step 1: contact
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Falls back to the signed-in account's email until the customer types
  // their own, instead of copying it into state via an effect.
  const effectiveEmail = email || user?.email || "";

  // Step 2: shipping
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [shippingNote, setShippingNote] = useState("");
  const [itemOverridesOn, setItemOverridesOn] = useState<Record<string, boolean>>({});
  const [itemAddresses, setItemAddresses] = useState<Record<string, ShippingAddress>>({});

  // Step 3: payment
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentPayerName, setPaymentPayerName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Step 4: confirm
  const [shippingFeeAgreed, setShippingFeeAgreed] = useState(false);

  const itemAddress = (id: string) => itemAddresses[id] ?? EMPTY_ADDRESS;
  const setItemAddress = (id: string, next: ShippingAddress) =>
    setItemAddresses((prev) => ({ ...prev, [id]: next }));
  const toggleItemOverride = (id: string) =>
    setItemOverridesOn((prev) => ({ ...prev, [id]: !prev[id] }));

  const { subtotal, discount, total, monthlyTotal } = computeTotals(
    items,
    discountRate,
    promoScope
  );

  const display = (amountUSD: number) =>
    formatCurrency(fromUSD(amountUSD, currency), currency);

  const orderSummaryList = (
    <div className="flex flex-col divide-y divide-black/10 rounded-2xl border border-black/10 px-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black">{item.title}</p>
            <p className="text-xs text-black/50">
              {item.color} · x{item.quantity}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-black">
            {display(item.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  );


  const goNext = () => {
    setStepError("");
    if (step === 1) {
      if (!customerName.trim() || !effectiveEmail.trim() || !phone.trim()) {
        setStepError("Please fill in your name, email, and phone number.");
        return;
      }
    }
    if (step === 2) {
      if (!isAddressComplete(shippingAddress)) {
        setStepError("Please fill in your region, province, city, and street address.");
        return;
      }
      const incompleteOverride = items.find(
        (item) => itemOverridesOn[item.id] && !isAddressComplete(itemAddress(item.id))
      );
      if (incompleteOverride) {
        setStepError(
          `Please finish the custom shipping address for "${incompleteOverride.title}", or turn it off.`
        );
        return;
      }
    }
    if (step === 3) {
      if (!paymentReference.trim() || !paymentPayerName.trim()) {
        setStepError("Please enter the transaction reference number and the name on the payment.");
        return;
      }
      if (!proofFile) {
        setStepError("Please upload a screenshot of your payment as proof.");
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => {
    setStepError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handlePlaceOrder = async () => {
    if (!shippingFeeAgreed) {
      setStepError(
        "Please confirm you agree to be contacted about the shipping fee before placing your order."
      );
      return;
    }
    setCheckingOut(true);
    setStepError("");
    try {
      // getSession() refreshes an expired access token if the refresh
      // token is still valid, so a session that went stale while filling
      // out the form doesn't get silently rejected by the RLS-scoped
      // insert below.
      const { data: sessionData } = await supabase.auth.getSession();
      const authedUserId = sessionData.session?.user.id;
      if (!authedUserId) {
        setStepError("Your session expired. Please sign in again.");
        router.replace(`/account?next=${encodeURIComponent(checkoutPath)}`);
        return;
      }

      let paymentProofPath: string | null = null;
      if (proofFile) {
        const ext = proofFile.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(path, proofFile);
        if (uploadError) throw uploadError;
        paymentProofPath = path;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: authedUserId,
          subtotal,
          discount,
          total,
          promo_code: appliedCode,
          currency: "USD",
          customer_name: customerName.trim(),
          email: effectiveEmail.trim(),
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
          payment_reference: paymentReference.trim(),
          payment_payer_name: paymentPayerName.trim(),
          payment_proof_path: paymentProofPath,
          shipping_fee_agreed: shippingFeeAgreed,
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

      redirectedRef.current = true;
      if (isPartial) {
        removeItems(items.map((i) => i.id));
      } else {
        clearCart();
      }
      setPlacedOrderId(order.id);
    } catch {
      setStepError("Something went wrong placing your order. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (placedOrderId) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <FiCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-black">Order placed!</h1>
        <p className="mt-2 text-sm text-black/60">
          Order #{placedOrderId.slice(0, 8)} — we&apos;ll verify your payment
          and get it moving.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/account"
            className="rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Track your order
          </Link>
          <Link
            href="/#buy"
            className="rounded-full border border-black px-6 py-3 text-center text-sm font-semibold text-black transition-opacity hover:opacity-60"
          >
            View other products
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0 || authLoading || !user) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-sm text-black/40">
          {authLoading ? "Loading…" : "Redirecting…"}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/cart"
        className="text-xs font-semibold text-black/40 underline hover:text-black"
      >
        ← Back to cart
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-black">Checkout</h1>

      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const isDone = n < step;
          const isActive = n === step;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone
                    ? "bg-black text-white"
                    : isActive
                      ? "border-2 border-black text-black"
                      : "border border-black/20 text-black/30"
                }`}
              >
                {isDone ? <FiCheck className="h-3.5 w-3.5" /> : n}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${isActive ? "text-black" : "text-black/40"}`}
              >
                {label}
              </span>
              {n < STEPS.length && (
                <div className={`h-px flex-1 ${isDone ? "bg-black" : "bg-black/10"}`} />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="mt-8">
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
              value={effectiveEmail}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black sm:col-span-2"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-black">Shipping address</p>
          <p className="mt-1 text-xs text-black/40">
            {items.length > 1
              ? "Applies to every item, unless you set a different address for one below."
              : "Where should we send your order?"}
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

          {items.length > 1 && (
            <div className="mt-6 border-t border-black/10 pt-6">
              <p className="text-sm font-semibold text-black">Per-item shipping</p>
              <div className="mt-3 flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItemOverride(item.id)}
                      className="text-xs font-semibold text-black underline decoration-black/30 underline-offset-2 hover:decoration-black"
                    >
                      {itemOverridesOn[item.id]
                        ? `Ship "${item.title}" to the address above instead`
                        : `Ship "${item.title}" to a different address`}
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
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-black">Payment</p>
          <p className="mt-1 text-xs text-black/40">
            Review your order, pay the total via GoTyme Bank / InstaPay, then tell
            us the details so we can match your payment.
          </p>

          <p className="mt-5 text-xs font-semibold text-black/60">Your order</p>
          <div className="mt-2">{orderSummaryList}</div>
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-sm text-black/60">Total to pay</span>
            <span className="text-lg font-bold text-black">{display(total)}</span>
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 p-4">
            <p className="text-xs font-semibold text-black/60">How to pay</p>
            <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm text-black/70">
              <li>Open your GoTyme Bank app, or any InstaPay-enabled bank app.</li>
              <li>Scan the QR code below to bring up the payment details.</li>
              <li>
                Send exactly <span className="font-semibold text-black">{display(total)}</span>.
              </li>
              <li>Enter your payment details below and upload a screenshot as proof.</li>
            </ol>
            <div className="mt-4 flex justify-center">
              <div className="relative h-64 w-52 overflow-hidden rounded-2xl border border-black/10">
                <Image
                  src="/payments/gotyme-qr.jpg"
                  alt="GoTyme Bank QR code for payment"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <input
              type="text"
              value={paymentPayerName}
              onChange={(e) => setPaymentPayerName(e.target.value)}
              placeholder="Name on the payment / sender name"
              className="rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black"
            />
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Transaction reference number"
              className="rounded-xl border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-black"
            />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/20 px-4 py-3 text-sm text-black/60 hover:border-black/40">
              <FiUpload className="h-4 w-4 shrink-0" />
              {proofFile ? proofFile.name : "Upload screenshot of payment"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <p className="text-xs text-black/40">
              Required — this speeds up verification and shipping.
            </p>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-black">Confirm your order</p>

          <div className="mt-3">{orderSummaryList}</div>

          <div className="mt-4 rounded-xl bg-black/[0.03] p-3 text-sm text-black/60">
            <p className="text-black">{customerName}</p>
            <p>{effectiveEmail} · {phone}</p>
            <p className="mt-1">{formatAddress(shippingAddress)}</p>
            <p className="mt-1">
              Paid by {paymentPayerName} · Ref: {paymentReference}
              {proofFile ? " · Screenshot attached" : ""}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/60">Subtotal</span>
              <span className="text-sm font-semibold text-black">{display(subtotal)}</span>
            </div>
            {appliedCode && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">Discount</span>
                <span className="text-sm font-semibold text-black">−{display(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/60">Total</span>
              <span className="text-xl font-bold text-black">{display(total)}</span>
            </div>
            {monthlyTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">+ Recurring (billed separately)</span>
                <span className="text-sm font-semibold text-black">
                  {display(monthlyTotal)}/month
                </span>
              </div>
            )}
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-xl bg-black/[0.03] p-3 text-xs text-black/60">
            <input
              type="checkbox"
              checked={shippingFeeAgreed}
              onChange={(e) => setShippingFeeAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-black"
            />
            <span>
              I agree to pay the applicable shipping fee. Our agents will contact me at{" "}
              <span className="font-semibold text-black">{phone}</span> to discuss the
              shipping fee and delivery details.
            </span>
          </label>
        </div>
      )}

      {stepError && (
        <p className="mt-4 text-center text-xs text-red-600">{stepError}</p>
      )}

      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold text-black transition-colors hover:border-black"
          >
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex-1 rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={checkingOut}
            className="flex-1 rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {checkingOut ? "Placing order…" : "Place order"}
          </button>
        )}
      </div>
    </main>
  );
}
