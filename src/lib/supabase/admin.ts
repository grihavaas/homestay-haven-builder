import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Creates a Supabase admin client with service role key.
 * ⚠️ WARNING: This has full admin access - only use in server-side code!
 * Never expose the service role key to the client.
 */
export function createSupabaseAdminClient() {
  if (!env.supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This is required for admin operations."
    );
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
