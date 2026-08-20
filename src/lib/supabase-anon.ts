import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Guest-checkout writes (orders/order_items/payment-proofs) are always
// scoped to the `anon` Postgres role via RLS, since orders has no user_id
// column. A shared, unauthenticated client keeps these writes on the anon
// role even in a tab where the visitor is also signed in elsewhere on the
// site (e.g. /account) — otherwise supabase-js attaches that session's
// JWT, and a stale/expired token gets rejected with a 401 at submit time.
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
