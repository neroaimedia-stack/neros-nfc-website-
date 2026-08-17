import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ADMIN_COOKIE_NAME, createAdminSession } from "@/lib/admin-session";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function invalidResponse() {
  return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
}

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: admin } = await supabaseAdmin
    .from("admin_credentials")
    .select("id, password_hash, failed_attempts, locked_until")
    .eq("email", email)
    .maybeSingle();

  if (!admin) return invalidResponse();

  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    const attempts = admin.failed_attempts + 1;
    const lockedUntil =
      attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
        : null;
    await supabaseAdmin
      .from("admin_credentials")
      .update({ failed_attempts: attempts, locked_until: lockedUntil })
      .eq("id", admin.id);
    return invalidResponse();
  }

  await supabaseAdmin
    .from("admin_credentials")
    .update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
    .eq("id", admin.id);

  const { token, expiresAt } = await createAdminSession(admin.id);

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true });
}
