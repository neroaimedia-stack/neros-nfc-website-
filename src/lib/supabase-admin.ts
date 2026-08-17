import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client for the admin dashboard only. Bypasses RLS entirely,
// so it must never be imported into client code — the "server-only" import
// above makes any accidental client-side import a build error.
//
// Built lazily (not at module load) so `next build` doesn't fail just
// because SUPABASE_SERVICE_ROLE_KEY isn't set in the local/build
// environment — the error only surfaces if an admin route is actually
// invoked without the key configured.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment to use the admin dashboard."
    );
  }

  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return client;
}
