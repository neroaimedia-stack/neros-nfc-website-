import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_BYTES = 5 * 1024 * 1024;

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "variant";
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");
  const slug = formData.get("slug");
  const variant = formData.get("variant");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (typeof slug !== "string" || !slug.trim() || typeof variant !== "string" || !variant.trim()) {
    return NextResponse.json({ error: "Missing slug or variant." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  const path = `${sanitizeSegment(slug)}/${sanitizeSegment(variant)}.jpg`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const db = getSupabaseAdmin();
  const { error } = await db.storage
    .from("product-media")
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = db.storage.from("product-media").getPublicUrl(path);
  return NextResponse.json({ url: `${data.publicUrl}?t=${Date.now()}` });
}
