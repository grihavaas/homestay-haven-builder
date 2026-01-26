import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";
import { env } from "@/lib/env";

export async function middleware(req: NextRequest) {
  const hostname = normalizeHostname(req.headers.get("host"));
  const isAdmin = isAdminHost(hostname);

  // Prevent accidental access to /admin on customer domains.
  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Create a response object
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Handle Supabase auth cookie refresh for admin routes
  // This ensures auth tokens are refreshed and cookies are updated
  if (isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    try {
      const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              res.cookies.set(name, value, options);
            });
          },
        },
      });

      // Refresh the session - this updates cookies if needed
      await supabase.auth.getUser();
    } catch (error) {
      // If there's an error with auth, allow the request to continue
      // The server component will handle the redirect if needed
      console.error("Middleware auth refresh error:", error);
    }
  }

  res.headers.set("x-homestay-host", hostname ?? "");
  res.headers.set("x-homestay-is-admin", isAdmin ? "1" : "0");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
