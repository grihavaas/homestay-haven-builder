import "server-only";
import { env } from "./env";

const VERCEL_TEAM_ID = "team_FpvxLpNB6UFSI0ejFa0gdPEW";
const VERCEL_PROJECT_ID = "prj_EbR42JOIhjqladEmOpA6jHC6BLOW";

function headers() {
  return {
    Authorization: `Bearer ${env.vercelApiToken}`,
    "Content-Type": "application/json",
  };
}

function teamQuery() {
  return `teamId=${VERCEL_TEAM_ID}`;
}

export interface VercelDnsRecord {
  type: string;
  name: string;
  value: string;
}

interface AddDomainResponse {
  name: string;
  apexName: string;
  verified: boolean;
  verification?: { type: string; domain: string; value: string }[];
}

/**
 * Register a domain on the Vercel project.
 * Returns the required DNS records for verification.
 */
export async function addDomainToVercel(
  hostname: string
): Promise<{ ok: true; dnsRecords: VercelDnsRecord[] } | { ok: false; error: string }> {
  const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains?${teamQuery()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name: hostname }),
  });

  // 409 = domain already exists on this project, treat as success
  if (res.ok || res.status === 409) {
    const data: AddDomainResponse = await res.json();
    const dnsRecords: VercelDnsRecord[] = [];

    if (data.verification) {
      for (const v of data.verification) {
        dnsRecords.push({ type: v.type, name: v.domain, value: v.value });
      }
    }

    // Always add CNAME/A record instruction
    const isApex = !hostname.includes(".") || hostname.split(".").length === 2;
    if (isApex) {
      dnsRecords.push({ type: "A", name: hostname, value: "76.76.21.21" });
    } else {
      dnsRecords.push({ type: "CNAME", name: hostname, value: "cname.vercel-dns.com" });
    }

    return { ok: true, dnsRecords };
  }

  const errBody = await res.json().catch(() => ({}));
  const message = (errBody as { error?: { message?: string } }).error?.message || `Vercel API error ${res.status}`;
  return { ok: false, error: message };
}

/**
 * Remove a domain from the Vercel project.
 */
export async function removeDomainFromVercel(hostname: string): Promise<void> {
  const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${hostname}?${teamQuery()}`;
  await fetch(url, {
    method: "DELETE",
    headers: headers(),
  });
  // Ignore errors — best-effort cleanup
}

interface DomainConfigResponse {
  misconfigured: boolean;
}

/**
 * Check whether the domain's DNS is properly configured on Vercel.
 */
export async function getDomainConfig(
  hostname: string
): Promise<{ configured: boolean } | { configured: false; error: string }> {
  const url = `https://api.vercel.com/v6/domains/${hostname}/config?${teamQuery()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = (errBody as { error?: { message?: string } }).error?.message || `Vercel API error ${res.status}`;
    return { configured: false, error: message };
  }

  const data: DomainConfigResponse = await res.json();
  return { configured: !data.misconfigured };
}
