import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select(
      "slug, title, description, price, compare_at_price, currency, colors, track_stock, stock_quantity, allow_preorder, sort_order, variant_details"
    )
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product"
  );
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { title?: unknown; price?: unknown; description?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const price = Number(body.price);
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  const { data: last } = await db
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (last?.sort_order ?? -1) + 1;

  const baseSlug = slugify(title);
  let slug = baseSlug;
  for (let attempt = 1; attempt <= 20; attempt++) {
    const { data: existing } = await db
      .from("products")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  const { error } = await db.from("products").insert({
    slug,
    title,
    description,
    price,
    currency: "USD",
    colors: [],
    sort_order: nextSortOrder,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, slug });
}
