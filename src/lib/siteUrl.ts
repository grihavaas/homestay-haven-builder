import type { NextRequest } from "next/server";

/**
 * Get the current site URL dynamically based on the request.
 * This handles both tenant-specific domains and admin domains.
 * 
 * @param req - Next.js request object (server-side only)
 * @returns The full URL (protocol + hostname + port) for the current request
 */
export function getCurrentSiteUrl(req?: NextRequest): string {
  // Server-side: get from request
  if (req) {
    const protocol = req.nextUrl.protocol.slice(0, -1); // Remove trailing ':'
    const host = req.headers.get("host") || req.nextUrl.host;
    return `${protocol}://${host}`;
  }
  
  // Client-side: get from window.location
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // Fallback (shouldn't happen in normal usage)
  const adminHost = process.env.NEXT_PUBLIC_ADMIN_HOST || "localhost";
  return `http://${adminHost}:3000`;
}

/**
 * Get the admin site URL (for admin-specific operations)
 * Always constructed from NEXT_PUBLIC_ADMIN_HOST
 */
export function getAdminSiteUrl(): string {
  const adminHost = process.env.NEXT_PUBLIC_ADMIN_HOST || "localhost";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const port = process.env.NODE_ENV === "production" ? "" : ":3000";
  return `${protocol}://${adminHost}${port}`;
}
