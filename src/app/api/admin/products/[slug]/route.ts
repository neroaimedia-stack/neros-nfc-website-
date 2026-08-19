import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ProductPatch = {
  price?: unknown;
  colors?: unknown;
  track_stock?: unknown;
  stock_quantity?: unknown;
  allow_preorder?: unknown;
  variant_details?: unknown;
};

type VariantDetailInput = {
  description?: unknown;
  price?: unknown;
  image_url?: unknown;
};

function isValidVariantDetails(value: unknown): value is Record<string, VariantDetailInput> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.entries(value as Record<string, unknown>).every(([, detail]) => {
    if (typeof detail !== "object" || detail === null || Array.isArray(detail)) return false;
    const d = detail as VariantDetailInput;
    if (d.description !== undefined && typeof d.description !== "string") return false;
    if (d.price !== undefined && d.price !== null && typeof d.price !== "number") return false;
    if (d.image_url !== undefined && d.image_url !== null && typeof d.image_url !== "string") return false;
    return true;
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { slug } = await params;

  let body: ProductPatch;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
    }
    update.price = price;
  }

  if (body.colors !== undefined) {
    if (
      !Array.isArray(body.colors) ||
      !body.colors.every((c) => typeof c === "string" && c.trim())
    ) {
      return NextResponse.json({ error: "Colors must be a list of non-empty strings." }, { status: 400 });
    }
    update.colors = body.colors.map((c) => (c as string).trim());
  }

  if (body.track_stock !== undefined) {
    if (typeof body.track_stock !== "boolean") {
      return NextResponse.json({ error: "track_stock must be a boolean." }, { status: 400 });
    }
    update.track_stock = body.track_stock;
  }

  if (body.stock_quantity !== undefined) {
    const qty = Number(body.stock_quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      return NextResponse.json({ error: "Stock quantity must be a non-negative whole number." }, { status: 400 });
    }
    update.stock_quantity = qty;
  }

  if (body.allow_preorder !== undefined) {
    if (typeof body.allow_preorder !== "boolean") {
      return NextResponse.json({ error: "allow_preorder must be a boolean." }, { status: 400 });
    }
    update.allow_preorder = body.allow_preorder;
  }

  if (body.variant_details !== undefined) {
    if (!isValidVariantDetails(body.variant_details)) {
      return NextResponse.json(
        { error: "variant_details must map variant names to { description?, price?, image_url? }." },
        { status: 400 }
      );
    }
    update.variant_details = body.variant_details;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("products")
    .update(update)
    .eq("slug", slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
