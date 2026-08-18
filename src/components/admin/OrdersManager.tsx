"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, fromUSD, toUSD } from "@/lib/currency";

type OrderItem = {
  id: string;
  product_slug: string;
  title: string;
  color: string | null;
  price: number;
  quantity: number;
  notes: string | null;
  name: string | null;
  job_title: string | null;
  qr_destination_link: string | null;
  nfc_destination_link: string | null;
  monthly_fee: number | null;
};

type Order = {
  id: string;
  subtotal: number;
  discount: number;
  total: number;
  promo_code: string | null;
  currency: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_OPTIONS = ["pending", "paid", "processing", "shipped", "completed", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (res.ok) setOrders(data.orders);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (order: Order, status: string) => {
    setOrders((prev) =>
      prev ? prev.map((o) => (o.id === order.id ? { ...o, status } : o)) : prev
    );
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const analytics = useMemo(() => {
    if (!orders) return null;
    const revenuePHP = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + fromUSD(toUSD(Number(o.total), o.currency), "PHP"), 0);
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return { revenuePHP, counts, total: orders.length };
  }, [orders]);

  if (orders === null) {
    return <p className="text-sm text-black/40">Loading orders…</p>;
  }

  return (
    <div>
      {analytics && (
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="rounded-2xl border border-black/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-black/50">
              Total revenue
            </p>
            <p className="mt-1 text-xl font-bold text-black">
              {formatCurrency(analytics.revenuePHP, "PHP")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-center">
            {STATUS_OPTIONS.filter((s) => analytics.counts[s]).map((s) => (
              <span
                key={s}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${STATUS_STYLES[s]}`}
              >
                {s}: {analytics.counts[s]}
              </span>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && <p className="text-sm text-black/40">No orders yet.</p>}

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="rounded-2xl border border-black/10">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black">
                    #{order.id.slice(0, 8)} · {order.order_items.length} item
                    {order.order_items.length === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-black/40">
                    {new Date(order.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-black">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? "bg-black/5 text-black/60"}`}
                  >
                    {order.status}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-black/10 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs font-medium text-black/50" htmlFor={`status-${order.id}`}>
                      Update status
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) => updateStatus(order, e.target.value)}
                      className="rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs font-medium capitalize outline-none focus:border-black"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {order.promo_code && (
                      <span className="text-xs text-black/40">
                        Promo: <span className="font-semibold text-black">{order.promo_code}</span>{" "}
                        (-{formatCurrency(order.discount, order.currency)})
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="rounded-xl bg-black/[0.03] p-3 text-sm">
                        <p className="font-semibold text-black">
                          {item.title}
                          {item.color ? ` · ${item.color}` : ""} × {item.quantity}
                        </p>
                        <p className="mt-0.5 text-black/60">
                          {formatCurrency(item.price, order.currency)} each
                          {item.monthly_fee
                            ? ` + ${formatCurrency(item.monthly_fee, order.currency)}/mo`
                            : ""}
                        </p>
                        {(item.name || item.job_title) && (
                          <p className="mt-1 text-black/60">
                            Personalization: {[item.name, item.job_title].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {item.qr_destination_link && (
                          <p className="mt-1 truncate text-black/60">
                            QR → {item.qr_destination_link}
                          </p>
                        )}
                        {item.nfc_destination_link && (
                          <p className="mt-1 truncate text-black/60">
                            NFC → {item.nfc_destination_link}
                          </p>
                        )}
                        {item.notes && (
                          <p className="mt-1 text-black/60">Notes: {item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
