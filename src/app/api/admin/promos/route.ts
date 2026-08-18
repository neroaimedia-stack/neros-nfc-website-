import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("promo_codes")
    .select("code, discount_rate, active, created_at, promo_code_products(product_slug)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const promos = (data ?? []).map((row) => {
    const { promo_code_products, ...rest } = row;
    return {
      ...rest,
      product_slugs: (promo_code_products ?? []).map((p) => p.product_slug),
    };
  });

  return NextResponse.json({ promos });
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { code?: unknown; discount_rate?: unknown; product_slugs?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const discountRate = Number(body.discount_rate);
  const productSlugs =
    body.product_slugs === undefined
      ? []
      : Array.isArray(body.product_slugs) &&
          body.product_slugs.every((s) => typeof s === "string")
        ? (body.product_slugs as string[])
        : null;

  if (!code) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }
  if (!Number.isFinite(discountRate) || discountRate <= 0 || discountRate > 1) {
    return NextResponse.json(
      { error: "Discount rate must be a number greater than 0 and at most 1 (e.g. 0.2 for 20% off)." },
      { status: 400 }
    );
  }
  if (productSlugs === null) {
    return NextResponse.json({ error: "product_slugs must be a list of strings." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { error } = await db
    .from("promo_codes")
    .insert({ code, discount_rate: discountRate, active: true });

  if (error) {
    const message = error.code === "23505" ? "That promo code already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (productSlugs.length > 0) {
    const { error: scopeError } = await db
      .from("promo_code_products")
      .insert(productSlugs.map((slug) => ({ promo_code: code, product_slug: slug })));
    if (scopeError) {
      return NextResponse.json({ error: scopeError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
