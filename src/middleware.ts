import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";
import { env } from "@/lib/env";

export async function middleware(req: NextRequest) {
  const hostname = normalizeHostname(req.headers.get("host"));
  const isAdmin = isAdminHost(hostname);

  // Debug logging for production troubleshooting
  if (process.env.DEBUG_AUTH && req.nextUrl.pathname.startsWith("/admin")) {
    const adminHost = process.env.NEXT_PUBLIC_ADMIN_HOST || "localhost";
    console.log("[Middleware]", {
      path: req.nextUrl.pathname,
      hostname,
      adminHost,
      isAdmin,
      cookieCount: req.cookies.getAll().length,
      authCookies: req.cookies.getAll().filter(c => c.name.includes("sb-")).map(c => c.name),
    });
  }

  // Prevent accidental access to /admin on customer domains.
  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Create a response object - important: we need to create this first
  // and then potentially modify it when Supabase sets cookies
  let res = NextResponse.next({
    request: req,
  });

  // Handle Supabase auth cookie refresh for admin routes
  // Supabase SSR automatically refreshes tokens and updates cookies
  if (isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    try {
      const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // When Supabase refreshes tokens, it calls setAll with new cookies
            // We need to set them on both the request (for downstream middleware/server components)
            // and on the response (to send back to the browser)
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set on request for downstream reads
              req.cookies.set(name, value);
              // Set on response to persist in browser
              // Ensure cookies work across the whole site
              res.cookies.set(name, value, {
                ...options,
                // Ensure path is set to root so cookies work for all routes
                path: options?.path ?? "/",
              });
            });
          },
        },
      });

      // Refresh the session - this may trigger setAll if token needs refresh
      // Use getUser() instead of getSession() as recommended by Supabase
      // getUser() validates the JWT with the server, ensuring the session is valid
      const { error } = await supabase.auth.getUser();

      if (error) {
        // Log auth errors for debugging (except on login pages)
        if (!req.nextUrl.pathname.startsWith("/admin/login") &&
            !req.nextUrl.pathname.startsWith("/admin/reset-password")) {
          console.log("Middleware auth check - no valid session:", error.message);
        }
      }
    } catch (error) {
      // If there's an error with auth, allow the request to continue
      // The server component will handle the redirect if needed
      if (!req.nextUrl.pathname.startsWith("/admin/login") &&
          !req.nextUrl.pathname.startsWith("/admin/reset-password")) {
        console.error("Middleware auth refresh error:", error);
      }
    }
  }

  res.headers.set("x-homestay-host", hostname ?? "");
  res.headers.set("x-homestay-is-admin", isAdmin ? "1" : "0");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
