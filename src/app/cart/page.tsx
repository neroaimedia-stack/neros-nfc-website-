"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, fromUSD } from "@/lib/currency";
import { computeTotals } from "@/lib/promo";
import ProductThumb from "@/components/ProductThumb";
import { FiInfo } from "react-icons/fi";

type OrderSummary = {
  id: string;
  total: number;
  currency: string;
  status: string;
  created_at: string;
  cancellation_requested: boolean;
  order_items: { id: string }[];
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Payment pending verification",
  paid: "Payment confirmed",
  processing: "Preparing your order",
  shipped: "On the way",
  completed: "Delivered",
  cancelled: "Cancelled",
};

const ORDER_STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500",
  paid: "bg-blue-500",
  processing: "bg-blue-400",
  shipped: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("orders")
      .select(
        "id, total, currency, status, created_at, cancellation_requested, order_items(id)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setOrders(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const requestCancel = async (orderId: string) => {
    setRequestingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ cancellation_requested: true })
      .eq("id", orderId);
    setRequestingId(null);
    if (!error) {
      setOrders((prev) =>
        prev
          ? prev.map((o) =>
              o.id === orderId ? { ...o, cancellation_requested: true } : o
            )
          : prev
      );
    }
  };

  if (orders === null || orders.length === 0) return null;

  return (
    <div className="mt-10 rounded-2xl border border-black/10 bg-white shadow-sm p-6">
      <p className="text-xs font-semibold tracking-wide text-black/40 uppercase">
        Order dashboard
      </p>
      <div className="mt-4 flex flex-col divide-y divide-black/10">
        {orders.map((order) => (
          <div key={order.id} className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black">
                  Order #{order.id.slice(0, 8)}
                </p>
                <p className="text-xs text-black/40">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {order.order_items.length} item
                  {order.order_items.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-black">
                {formatCurrency(order.total, order.currency)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    ORDER_STATUS_DOT[order.status] ?? "bg-black/30"
                  }`}
                />
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              {order.status === "pending" &&
                (order.cancellation_requested ? (
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/50">
                    Cancellation requested
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => requestCancel(order.id)}
                    disabled={requestingId === order.id}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                  >
                    {requestingId === order.id ? "Requesting…" : "Request to cancel"}
                  </button>
                ))}
            </div>
            {order.status === "pending" && order.cancellation_requested && (
              <p className="mt-1.5 text-xs text-black/40">
                We&apos;ll review and confirm shortly.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    removeItem,
    removeItems,
    updateQuantity,
    appliedCode,
    discountRate,
    promoScope,
    applyPromo,
    removePromo,
  } = useCart();
  const currency = useCurrency();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { subtotal, discount, total, monthlyTotal } = computeTotals(
    items,
    discountRate,
    promoScope
  );
  const promoAppliesToNothing =
    appliedCode !== null && promoScope.length > 0 && subtotal > 0 && discount === 0;

  const display = (amountUSD: number) =>
    formatCurrency(fromUSD(amountUSD, currency), currency);

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.length === items.length ? [] : items.map((i) => i.id)
    );

  const handleDeleteSelected = () => {
    removeItems(selectedIds);
    setSelectedIds([]);
  };

  const handleCheckoutSelected = () => {
    router.push(`/checkout?items=${selectedIds.join(",")}`);
  };

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
      removePromo();
      setPromoError("Invalid promo code");
      return;
    }
    const { data: scopeRows } = await supabase
      .from("promo_code_products")
      .select("product_slug, variant")
      .eq("promo_code", code);
    setCheckingPromo(false);
    applyPromo(
      code,
      Number(data.discount_rate),
      (scopeRows ?? []).map((r) => ({ slug: r.product_slug, variant: r.variant }))
    );
    setPromoError("");
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoInput("");
    setPromoError("");
    setShowPromoInput(false);
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-black">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-black/15 px-6 py-12 text-center">
          <p className="text-sm text-black/60">Your cart is empty.</p>
          <Link
            href="/#buy"
            className="mt-4 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Browse cards
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white shadow-sm p-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-black/60">
          <FiInfo className="h-3.5 w-3.5 shrink-0 text-black/40" />
          <span>
            PH orders only —{" "}
            <a
              href="mailto:herneros.ph@gmail.com?subject=International%20Bulk%20Order"
              className="font-semibold text-black underline underline-offset-2 hover:text-black/70"
            >
              email us
            </a>{" "}
            to order bulk outside PH.
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectMode((s) => !s);
            setSelectedIds([]);
          }}
          className="ml-auto shrink-0 rounded-full border border-black/20 px-3.5 py-1.5 text-xs font-semibold text-black transition-colors hover:border-black"
        >
          {selectMode ? "Cancel" : "Select"}
        </button>
      </div>

      {selectMode && (
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs font-semibold text-black underline decoration-black/30 underline-offset-2 hover:decoration-black"
          >
            {selectedIds.length === items.length ? "Deselect all" : "Select all"}
          </button>
          <span className="text-xs text-black/40">
            {selectedIds.length} selected
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-col divide-y divide-black/10">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 py-5">
            <div className="flex shrink-0 items-center gap-3">
              {selectMode && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelected(item.id)}
                  aria-label={`Select ${item.title}`}
                  className="h-4 w-4 shrink-0 accent-black"
                />
              )}
              <ProductThumb
                slug={item.productSlug}
                variant={item.color}
                className="w-16 shrink-0"
              />
            </div>
            <div className="flex flex-1 items-center justify-between gap-3">
              <div className="min-w-0">
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
                {!!item.monthlyFee && (
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
              <div className="flex shrink-0 items-center gap-4">
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

      {selectMode ? (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="flex-1 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
          >
            Delete selected{selectedIds.length ? ` (${selectedIds.length})` : ""}
          </button>
          <button
            type="button"
            onClick={handleCheckoutSelected}
            disabled={selectedIds.length === 0}
            className="flex-1 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            Checkout selected{selectedIds.length ? ` (${selectedIds.length})` : ""}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="mt-6 block w-full rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Checkout
        </button>
      )}
        </div>
      )}

      {user && <OrderHistory userId={user.id} />}
    </main>
  );
}
