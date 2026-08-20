import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const db = getSupabaseAdmin();

  const [reviewsRes, productsRes] = await Promise.all([
    db
      .from("product_reviews")
      .select("id, product_slug, user_id, rating, message, created_at")
      .order("created_at", { ascending: false }),
    db.from("products").select("slug, title").order("sort_order", { ascending: true }),
  ]);

  if (reviewsRes.error) {
    return NextResponse.json({ error: reviewsRes.error.message }, { status: 500 });
  }
  if (productsRes.error) {
    return NextResponse.json({ error: productsRes.error.message }, { status: 500 });
  }

  const titleBySlug = new Map((productsRes.data ?? []).map((p) => [p.slug, p.title]));
  const reviews = (reviewsRes.data ?? []).map((r) => ({
    ...r,
    product_title: titleBySlug.get(r.product_slug) ?? r.product_slug,
    added_by_admin: r.user_id === null,
  }));

  return NextResponse.json({ reviews, products: productsRes.data ?? [] });
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { product_slug?: unknown; rating?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productSlug = typeof body.product_slug === "string" ? body.product_slug.trim() : "";
  const rating = Number(body.rating);
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!productSlug) {
    return NextResponse.json({ error: "Product is required." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be a whole number from 1 to 5." }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from("product_reviews").insert({
    product_slug: productSlug,
    user_id: null,
    rating,
    message: message || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
