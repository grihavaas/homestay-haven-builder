import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";
import { env } from "@/lib/env";

export async function middleware(req: NextRequest) {
  const hostname = normalizeHostname(req.headers.get("host"));
  const isAdmin = isAdminHost(hostname);

  // Prevent accidental access to /admin on customer domains
  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  let res = NextResponse.next({
    request: req,
  });

  // Handle Supabase auth cookie refresh for admin routes
  const shouldRefreshAuth = isAdmin &&
    req.nextUrl.pathname.startsWith("/admin") &&
    !req.nextUrl.pathname.startsWith("/admin/login") &&
    !req.nextUrl.pathname.startsWith("/admin/reset-password") &&
    !req.nextUrl.pathname.startsWith("/admin/logout");

  if (shouldRefreshAuth) {
    try {
      const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              res.cookies.set(name, value, {
                ...options,
                path: options?.path ?? "/",
              });
            });
          },
        },
      });

      // Read session from cookies (doesn't make network request)
      await supabase.auth.getSession();
    } catch {
      // Auth errors are handled by server components
    }
  }

  res.headers.set("x-homestay-host", hostname ?? "");
  res.headers.set("x-homestay-is-admin", isAdmin ? "1" : "0");

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
