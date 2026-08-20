import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, subtotal, discount, total, promo_code, currency, status, created_at, customer_name, email, phone, shipping_country, shipping_region, shipping_province, shipping_city, shipping_barangay, shipping_house_no, shipping_street, shipping_postal_code, shipping_note, payment_reference, payment_payer_name, payment_proof_path, shipping_fee_agreed, order_items(id, product_slug, title, color, price, quantity, notes, name, job_title, qr_destination_link, nfc_destination_link, monthly_fee, ship_country, ship_region, ship_province, ship_city, ship_barangay, ship_house_no, ship_street, ship_postal_code)"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = await Promise.all(
    (data ?? []).map(async (order) => {
      if (!order.payment_proof_path) return { ...order, payment_proof_url: null };
      const { data: signed } = await supabaseAdmin.storage
        .from("payment-proofs")
        .createSignedUrl(order.payment_proof_path, 3600);
      return { ...order, payment_proof_url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ orders });
}
