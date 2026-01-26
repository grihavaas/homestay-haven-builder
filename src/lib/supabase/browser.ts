import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file."
    );
  }
  
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
