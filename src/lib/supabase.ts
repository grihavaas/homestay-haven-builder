import { createClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./supabase/browser";
import { env } from "./env";

// Legacy client for backward compatibility (use createSupabaseBrowserClient instead)
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

// Use browser client for auth operations
export { createSupabaseBrowserClient };
