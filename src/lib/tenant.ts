export function normalizeHostname(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  // Strip port if present (localhost:3000)
  const host = hostHeader.split(":")[0]?.toLowerCase();
  return host || null;
}

export function isAdminHost(hostname: string | null): boolean {
  if (!hostname) return false;
  const adminHosts = (process.env.NEXT_PUBLIC_ADMIN_HOST || "localhost")
    .split(",")
    .map((h) => h.trim().toLowerCase());
  return adminHosts.includes(hostname);
}
