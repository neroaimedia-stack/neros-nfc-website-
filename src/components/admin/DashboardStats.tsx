"use client";

import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCreditCard,
  FiShoppingBag,
  FiTag,
  FiTrendingUp,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { formatCurrency } from "@/lib/currency";

type Stats = {
  totalRevenuePHP: number;
  orderCount: number;
  ordersLast7Days: number;
  activePromoCount: number;
  cardsTotal: number;
  cardsClaimed: number;
  lowStockProducts: { title: string; stock_quantity: number }[];
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: IconType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-5">
      <div className="flex items-center gap-2 text-black/50">
        <Icon className="h-4 w-4 shrink-0" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-black">{value}</p>
      {hint && <p className="mt-1 text-xs text-black/40">{hint}</p>}
    </div>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (active) setStats(data);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!stats) {
    return <p className="text-sm text-black/40">Loading stats…</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={FiTrendingUp}
        label="Total revenue"
        value={formatCurrency(stats.totalRevenuePHP, "PHP")}
      />
      <StatCard
        icon={FiShoppingBag}
        label="Orders"
        value={String(stats.orderCount)}
        hint={`${stats.ordersLast7Days} in the last 7 days`}
      />
      <StatCard
        icon={FiTag}
        label="Active promo codes"
        value={String(stats.activePromoCount)}
      />
      <StatCard
        icon={FiCreditCard}
        label="NFC cards claimed"
        value={`${stats.cardsClaimed} / ${stats.cardsTotal}`}
      />
      {stats.lowStockProducts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 text-amber-700">
            <FiAlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs font-medium uppercase tracking-wide">Low stock</p>
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {stats.lowStockProducts.map((p) => (
              <li key={p.title} className="text-sm text-amber-900">
                {p.title} — {p.stock_quantity} left
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
