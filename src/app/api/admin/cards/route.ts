import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("cards")
    .select("id, code, product_type, owner_user_id, claimed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cards = data ?? [];
  const ownerIds = Array.from(
    new Set(cards.map((c) => c.owner_user_id).filter((id): id is string => !!id))
  );
  const businessCardIds = cards
    .filter((c) => c.owner_user_id && c.product_type === "business-card")
    .map((c) => c.id);

  const emailMap = new Map<string, string | null>();
  await Promise.all(
    ownerIds.map(async (id) => {
      const { data: userData } = await db.auth.admin.getUserById(id);
      emailMap.set(id, userData.user?.email ?? null);
    })
  );

  let profileRows: { card_id: string; full_name: string | null; avatar_url: string | null }[] = [];
  if (businessCardIds.length > 0) {
    const { data: rows } = await db
      .from("business_profiles")
      .select("card_id, full_name, avatar_url")
      .in("card_id", businessCardIds);
    profileRows = rows ?? [];
  }
  const profileMap = new Map(profileRows.map((p) => [p.card_id, p]));

  const enriched = cards.map((c) => ({
    ...c,
    owner_email: c.owner_user_id ? (emailMap.get(c.owner_user_id) ?? null) : null,
    profile_name: profileMap.get(c.id)?.full_name ?? null,
    profile_avatar_url: profileMap.get(c.id)?.avatar_url ?? null,
  }));

  return NextResponse.json({ cards: enriched });
}
