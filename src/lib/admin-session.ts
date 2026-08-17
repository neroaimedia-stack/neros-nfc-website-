import "server-only";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_HOURS = 12;

export type AdminSession = { id: string; email: string };

export async function createAdminSession(adminId: string) {
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000);
  const { data, error } = await getSupabaseAdmin()
    .from("admin_sessions")
    .insert({ admin_id: adminId, expires_at: expiresAt.toISOString() })
    .select("token")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create admin session");
  return { token: data.token as string, expiresAt };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const { data } = await getSupabaseAdmin()
    .from("admin_sessions")
    .select("admin_id, expires_at, admin_credentials(id, email)")
    .eq("token", token)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const admin = Array.isArray(data.admin_credentials)
    ? data.admin_credentials[0]
    : data.admin_credentials;
  if (!admin) return null;

  return { id: admin.id as string, email: admin.email as string };
}

export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (token) {
    await getSupabaseAdmin().from("admin_sessions").delete().eq("token", token);
  }
  store.delete(ADMIN_COOKIE_NAME);
}
