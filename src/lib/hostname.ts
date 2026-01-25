export function normalizeHostname(host: string | null): string | null {
  if (!host) return null;
  const normalized = host.split(":")[0]?.toLowerCase();
  return normalized || null;
}

export function getCurrentHostname(): string | null {
  if (typeof window === "undefined") return null;
  return normalizeHostname(window.location.hostname);
}
