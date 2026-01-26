import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  // Debug: Check if auth cookies are present (only in development or with debug flag)
  if (process.env.NODE_ENV === "development" || process.env.DEBUG_AUTH) {
    const allCookies = cookieStore.getAll();
    const authCookies = allCookies.filter(c => c.name.includes("sb-") || c.name.includes("auth"));
    if (authCookies.length > 0) {
      console.log("Found auth cookies:", authCookies.map(c => c.name));
    } else {
      console.log("No auth cookies found. Total cookies:", allCookies.length);
    }
  }

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          // Let Supabase handle cookie options - don't override them
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where setting cookies is not allowed.
        }
      },
    },
  });
}
