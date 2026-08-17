import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generateCardCode, PRODUCT_TYPES, type ProductType } from "@/lib/card-codes";

const MAX_BATCH = 100;

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { product_type?: unknown; count?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productType = body.product_type as ProductType;
  const count = Number(body.count);

  if (!PRODUCT_TYPES.includes(productType)) {
    return NextResponse.json({ error: "Invalid product type." }, { status: 400 });
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH) {
    return NextResponse.json(
      { error: `Count must be a whole number between 1 and ${MAX_BATCH}.` },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const created: { code: string; product_type: string }[] = [];

  for (let i = 0; i < count; i++) {
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const code = generateCardCode();
      const { error } = await supabaseAdmin
        .from("cards")
        .insert({ code, product_type: productType });

      if (!error) {
        created.push({ code, product_type: productType });
        inserted = true;
      } else if (error.code !== "23505") {
        // Not a unique-code collision — bail out with the real error.
        return NextResponse.json(
          { error: error.message, created },
          { status: 500 }
        );
      }
    }
    if (!inserted) {
      return NextResponse.json(
        { error: "Couldn't generate a unique code after several attempts.", created },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ created });
}
