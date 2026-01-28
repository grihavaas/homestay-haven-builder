import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";
import { env } from "@/lib/env";

export async function middleware(req: NextRequest) {
  const hostname = normalizeHostname(req.headers.get("host"));
  const isAdmin = isAdminHost(hostname);

  // Allow auth routes on tenant domains (needed for tap-to-edit feature)
  // Block other admin routes on non-admin hosts
  const isAuthRoute =
    req.nextUrl.pathname === "/admin/login" ||
    req.nextUrl.pathname === "/admin/logout" ||
    req.nextUrl.pathname === "/admin/reset-password";

  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin") && !isAuthRoute) {
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

  // Prevent search engines from indexing preview/development environments
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv && vercelEnv !== "production") {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
