import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  // Debug: Check if auth cookies are present (always log in production for now to debug)
  if (process.env.NODE_ENV === "development" || process.env.DEBUG_AUTH) {
    const allCookies = cookieStore.getAll();
    const authCookies = allCookies.filter(c => c.name.includes("sb-") || c.name.includes("auth"));
    if (authCookies.length > 0) {
      console.log("[Server] Found auth cookies:", authCookies.map(c => c.name));
    } else {
      console.log("[Server] No auth cookies found. Total cookies:", allCookies.length);
      // Log all cookie names to help debug
      console.log("[Server] All cookie names:", allCookies.map(c => c.name));
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
            cookieStore.set(name, value, {
              ...options,
              // Ensure cookies work across the whole site
              path: options?.path ?? "/",
            }),
          );
        } catch {
          // Called from a Server Component where setting cookies is not allowed.
          // This is expected - cookies should have been set by middleware
        }
      },
    },
  });
}
