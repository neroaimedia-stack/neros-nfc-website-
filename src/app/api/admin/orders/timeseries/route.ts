import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { toUSD, fromUSD } from "@/lib/currency";

const DAYS = 14;

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("total, currency, status, created_at")
    .gte("created_at", since.toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byDate = new Map<string, { orders: number; revenuePHP: number }>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDate.set(d.toISOString().slice(0, 10), { orders: 0, revenuePHP: 0 });
  }

  for (const order of data ?? []) {
    const key = order.created_at.slice(0, 10);
    const bucket = byDate.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    if (order.status !== "cancelled") {
      bucket.revenuePHP += fromUSD(toUSD(Number(order.total), order.currency), "PHP");
    }
  }

  const series = Array.from(byDate.entries()).map(([date, v]) => ({
    date,
    orders: v.orders,
    revenuePHP: v.revenuePHP,
  }));

  return NextResponse.json({ series });
}
