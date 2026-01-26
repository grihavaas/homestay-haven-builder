import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";

export function middleware(req: NextRequest) {
  const hostname = normalizeHostname(req.headers.get("host"));
  const isAdmin = isAdminHost(hostname);

  // Prevent accidental access to /admin on customer domains.
  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-homestay-host", hostname ?? "");
  res.headers.set("x-homestay-is-admin", isAdmin ? "1" : "0");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
