import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ScopeEntry = { slug: string; variant: string };

function isValidScope(value: unknown): value is ScopeEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as ScopeEntry).slug === "string" &&
        (v as ScopeEntry).slug.trim() &&
        typeof (v as ScopeEntry).variant === "string"
    )
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { code } = await params;
  const decodedCode = decodeURIComponent(code);

  let body: { active?: unknown; scope?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      return NextResponse.json({ error: "active must be a boolean." }, { status: 400 });
    }
    const { error } = await db
      .from("promo_codes")
      .update({ active: body.active })
      .eq("code", decodedCode);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.scope !== undefined) {
    if (!isValidScope(body.scope)) {
      return NextResponse.json({ error: "scope must be a list of { slug, variant }." }, { status: 400 });
    }
    const { error: deleteError } = await db
      .from("promo_code_products")
      .delete()
      .eq("promo_code", decodedCode);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    if (body.scope.length > 0) {
      const { error: insertError } = await db.from("promo_code_products").insert(
        body.scope.map((s) => ({
          promo_code: decodedCode,
          product_slug: s.slug,
          variant: s.variant,
        }))
      );
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { code } = await params;

  const { error } = await getSupabaseAdmin()
    .from("promo_codes")
    .delete()
    .eq("code", decodeURIComponent(code));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
