import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("promo_codes")
    .select("code, discount_rate, active, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promos: data });
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { code?: unknown; discount_rate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const discountRate = Number(body.discount_rate);

  if (!code) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }
  if (!Number.isFinite(discountRate) || discountRate <= 0 || discountRate > 1) {
    return NextResponse.json(
      { error: "Discount rate must be a number greater than 0 and at most 1 (e.g. 0.2 for 20% off)." },
      { status: 400 }
    );
  }

  const { error } = await getSupabaseAdmin()
    .from("promo_codes")
    .insert({ code, discount_rate: discountRate, active: true });

  if (error) {
    const message = error.code === "23505" ? "That promo code already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
