import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { toUSD, fromUSD } from "@/lib/currency";
import { RANGE_KEYS, type RangeKey } from "@/lib/order-ranges";

// The business operates in the Philippines — bucket "today"/"this week"
// etc. against PH local time rather than the server's UTC clock.
const PH_OFFSET_MS = 8 * 60 * 60 * 1000;
const toPH = (d: Date) => new Date(d.getTime() + PH_OFFSET_MS);
const fromPH = (d: Date) => new Date(d.getTime() - PH_OFFSET_MS);

type Granularity = "hour" | "day" | "week" | "month";

function getRangeConfig(range: RangeKey): { start: Date; end: Date; granularity: Granularity } {
  const nowPH = toPH(new Date());
  const startOfDayPH = (d: Date) => {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  };

  switch (range) {
    case "today":
      return { start: startOfDayPH(nowPH), end: nowPH, granularity: "hour" };
    case "yesterday": {
      const y = new Date(nowPH);
      y.setUTCDate(y.getUTCDate() - 1);
      const start = startOfDayPH(y);
      const end = new Date(start);
      end.setUTCHours(23, 59, 59, 999);
      return { start, end, granularity: "hour" };
    }
    case "week": {
      const start = startOfDayPH(nowPH);
      start.setUTCDate(start.getUTCDate() - 6);
      return { start, end: nowPH, granularity: "day" };
    }
    case "month": {
      const start = startOfDayPH(nowPH);
      start.setUTCDate(start.getUTCDate() - 29);
      return { start, end: nowPH, granularity: "day" };
    }
    case "3months": {
      const start = startOfDayPH(nowPH);
      start.setUTCMonth(start.getUTCMonth() - 3);
      return { start, end: nowPH, granularity: "week" };
    }
    case "year": {
      const start = new Date(Date.UTC(nowPH.getUTCFullYear(), 0, 1));
      return { start, end: nowPH, granularity: "month" };
    }
    case "3years": {
      const start = new Date(Date.UTC(nowPH.getUTCFullYear() - 2, 0, 1));
      return { start, end: nowPH, granularity: "month" };
    }
  }
}

function bucketKey(datePH: Date, granularity: Granularity): string {
  if (granularity === "hour") {
    return `${datePH.toISOString().slice(0, 10)}T${String(datePH.getUTCHours()).padStart(2, "0")}`;
  }
  if (granularity === "week") {
    const d = new Date(datePH);
    const dayOfWeek = (d.getUTCDay() + 6) % 7; // Monday = 0
    d.setUTCDate(d.getUTCDate() - dayOfWeek);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }
  if (granularity === "month") {
    return datePH.toISOString().slice(0, 7);
  }
  return datePH.toISOString().slice(0, 10);
}

function enumerateBuckets(start: Date, end: Date, granularity: Granularity): string[] {
  const buckets: string[] = [];
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 2000) {
    buckets.push(bucketKey(cur, granularity));
    if (granularity === "hour") cur.setUTCHours(cur.getUTCHours() + 1);
    else if (granularity === "day") cur.setUTCDate(cur.getUTCDate() + 1);
    else if (granularity === "week") cur.setUTCDate(cur.getUTCDate() + 7);
    else cur.setUTCMonth(cur.getUTCMonth() + 1);
    guard += 1;
  }
  return Array.from(new Set(buckets));
}

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("range") as RangeKey | null;
  const range: RangeKey = requested && RANGE_KEYS.includes(requested) ? requested : "week";
  const { start, end, granularity } = getRangeConfig(range);

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("total, currency, status, created_at")
    .gte("created_at", fromPH(start).toISOString())
    .lte("created_at", fromPH(end).toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const bucketKeys = enumerateBuckets(start, end, granularity);
  const byBucket = new Map<string, { orders: number; revenuePHP: number }>();
  for (const key of bucketKeys) byBucket.set(key, { orders: 0, revenuePHP: 0 });

  for (const order of data ?? []) {
    const key = bucketKey(toPH(new Date(order.created_at)), granularity);
    const bucket = byBucket.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    if (order.status !== "cancelled") {
      bucket.revenuePHP += fromUSD(toUSD(Number(order.total), order.currency), "PHP");
    }
  }

  const series = bucketKeys.map((key) => ({
    date: key,
    orders: byBucket.get(key)!.orders,
    revenuePHP: byBucket.get(key)!.revenuePHP,
  }));

  return NextResponse.json({ series, granularity, range });
}
