import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { toUSD, fromUSD } from "@/lib/currency";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const db = getSupabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [orders, recentOrders, lowStockProducts] = await Promise.all([
    db.from("orders").select("total, currency"),
    db.from("orders").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    db
      .from("products")
      .select("title, stock_quantity")
      .eq("track_stock", true)
      .lte("stock_quantity", 5)
      .order("stock_quantity", { ascending: true }),
  ]);

  if (orders.error) return NextResponse.json({ error: orders.error.message }, { status: 500 });

  const orderCount = orders.data?.length ?? 0;
  const totalRevenueUSD = (orders.data ?? []).reduce(
    (sum, o) => sum + toUSD(Number(o.total ?? 0), o.currency ?? "USD"),
    0
  );
  const totalRevenuePHP = fromUSD(totalRevenueUSD, "PHP");
  const avgOrderValuePHP = orderCount > 0 ? totalRevenuePHP / orderCount : 0;

  return NextResponse.json({
    totalRevenuePHP,
    orderCount,
    ordersLast7Days: recentOrders.count ?? 0,
    avgOrderValuePHP,
    lowStockProducts: lowStockProducts.data ?? [],
  });
}
