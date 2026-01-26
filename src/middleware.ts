import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";
import { env } from "@/lib/env";

export async function middleware(req: NextRequest) {
  const hostname = normalizeHostname(req.headers.get("host"));
  const isAdmin = isAdminHost(hostname);

  // Debug logging for production troubleshooting
  const debugAuth = process.env.DEBUG_AUTH === "true";
  if (debugAuth && req.nextUrl.pathname.startsWith("/admin")) {
    const adminHost = process.env.NEXT_PUBLIC_ADMIN_HOST || "localhost";
    const allCookies = req.cookies.getAll();
    const authCookies = allCookies.filter(c => c.name.includes("sb-"));
    console.log("[Middleware] Request:", {
      path: req.nextUrl.pathname,
      hostname,
      adminHost,
      isAdmin,
      cookieCount: allCookies.length,
      authCookieNames: authCookies.map(c => c.name),
    });
  }

  // Prevent accidental access to /admin on customer domains.
  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Create response - we'll modify it if we need to update cookies
  let res = NextResponse.next({
    request: req,
  });

  // Handle Supabase auth cookie refresh for admin routes
  // Only process if this is an admin host and an admin route (not login/reset pages)
  const shouldRefreshAuth = isAdmin &&
    req.nextUrl.pathname.startsWith("/admin") &&
    !req.nextUrl.pathname.startsWith("/admin/login") &&
    !req.nextUrl.pathname.startsWith("/admin/reset-password") &&
    !req.nextUrl.pathname.startsWith("/admin/logout");

  if (shouldRefreshAuth) {
    try {
      // Create Supabase client with cookie handling
      const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Log when cookies are being set/cleared
            if (debugAuth) {
              cookiesToSet.forEach(({ name, value, options }) => {
                const isDeleting = !value || options?.maxAge === 0;
                console.log(`[Middleware] Cookie ${isDeleting ? 'DELETE' : 'SET'}: ${name}`, {
                  hasValue: !!value,
                  maxAge: options?.maxAge,
                  path: options?.path,
                });
              });
            }

            // Apply cookies to both request and response
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

      // IMPORTANT: Only call getSession() which reads from cookies without validation.
      // Do NOT call getUser() here as it makes a request to Supabase and can trigger
      // token refresh which may fail and clear all cookies.
      const { data: { session }, error } = await supabase.auth.getSession();

      if (debugAuth) {
        console.log("[Middleware] getSession result:", {
          hasSession: !!session,
          error: error?.message,
          accessTokenExp: session?.expires_at,
        });
      }
    } catch (error) {
      // Log but don't block - server component will handle auth
      if (debugAuth) {
        console.error("[Middleware] Auth error (non-blocking):", error);
      }
    }
  }

  // Set custom headers for downstream use
  res.headers.set("x-homestay-host", hostname ?? "");
  res.headers.set("x-homestay-is-admin", isAdmin ? "1" : "0");

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
