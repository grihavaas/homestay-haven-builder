export function normalizeHostname(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  // Strip port if present (localhost:3000)
  const host = hostHeader.split(":")[0]?.toLowerCase();
  return host || null;
}

export function isAdminHost(hostname: string | null): boolean {
  if (!hostname) return false;
  // Read directly from process.env for Next.js
  const adminHost = process.env.NEXT_PUBLIC_ADMIN_HOST || "localhost";
  return hostname === adminHost.toLowerCase();
}
