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

  const [orders, recentOrders, activePromos, cardsTotal, cardsClaimed, lowStockProducts] =
    await Promise.all([
      db.from("orders").select("total, currency"),
      db.from("orders").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      db.from("promo_codes").select("code", { count: "exact", head: true }).eq("active", true),
      db.from("cards").select("id", { count: "exact", head: true }),
      db.from("cards").select("id", { count: "exact", head: true }).not("claimed_at", "is", null),
      db
        .from("products")
        .select("title, stock_quantity")
        .eq("track_stock", true)
        .lte("stock_quantity", 5)
        .order("stock_quantity", { ascending: true }),
    ]);

  if (orders.error) return NextResponse.json({ error: orders.error.message }, { status: 500 });

  const totalRevenueUSD = (orders.data ?? []).reduce(
    (sum, o) => sum + toUSD(Number(o.total ?? 0), o.currency ?? "USD"),
    0
  );
  const totalRevenuePHP = fromUSD(totalRevenueUSD, "PHP");

  return NextResponse.json({
    totalRevenuePHP,
    orderCount: orders.data?.length ?? 0,
    ordersLast7Days: recentOrders.count ?? 0,
    activePromoCount: activePromos.count ?? 0,
    cardsTotal: cardsTotal.count ?? 0,
    cardsClaimed: cardsClaimed.count ?? 0,
    lowStockProducts: lowStockProducts.data ?? [],
  });
}
