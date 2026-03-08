"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  addDomainToVercel,
  removeDomainFromVercel,
  getDomainConfig,
} from "@/lib/vercel";

function domainPath(propertyId: string) {
  return `/admin/agency/properties/${propertyId}/domains`;
}

export async function addDomainAction(
  propertyId: string,
  tenantId: string,
  formData: FormData
) {
  const hostname = String(formData.get("hostname") ?? "")
    .trim()
    .toLowerCase();
  const isPrimary = Boolean(formData.get("is_primary"));
  if (!hostname) return;

  const supabase = await createSupabaseServerClient();

  // If setting primary, unset others for this property
  if (isPrimary) {
    const { error: unsetErr } = await supabase
      .from("domains")
      .update({ is_primary: false })
      .eq("property_id", propertyId);
    if (unsetErr) throw unsetErr;
  }

  // Insert with pending_vercel status
  const { data: domain, error: insertErr } = await supabase
    .from("domains")
    .insert({
      tenant_id: tenantId,
      property_id: propertyId,
      hostname,
      is_primary: isPrimary,
      domain_status: "pending_vercel",
      verified_at: null,
    })
    .select("id")
    .single();
  if (insertErr) throw insertErr;

  // Register on Vercel
  const result = await addDomainToVercel(hostname);

  if (result.ok) {
    await supabase
      .from("domains")
      .update({
        domain_status: "pending_dns",
        dns_records: result.dnsRecords,
        vercel_error: null,
      })
      .eq("id", domain.id);
  } else {
    await supabase
      .from("domains")
      .update({
        domain_status: "error",
        vercel_error: result.error,
      })
      .eq("id", domain.id);
  }

  revalidatePath(domainPath(propertyId));
}

export async function deleteDomainAction(
  propertyId: string,
  formData: FormData
) {
  const domainId = String(formData.get("domainId") ?? "");
  if (!domainId) return;

  const supabase = await createSupabaseServerClient();

  // Fetch hostname to remove from Vercel
  const { data: domain } = await supabase
    .from("domains")
    .select("hostname")
    .eq("id", domainId)
    .single();

  if (domain?.hostname) {
    await removeDomainFromVercel(domain.hostname);
  }

  const { error } = await supabase
    .from("domains")
    .delete()
    .eq("id", domainId);
  if (error) throw error;

  revalidatePath(domainPath(propertyId));
}

export async function verifyDomainAction(
  propertyId: string,
  formData: FormData
) {
  const domainId = String(formData.get("domainId") ?? "");
  if (!domainId) return;

  const supabase = await createSupabaseServerClient();

  const { data: domain } = await supabase
    .from("domains")
    .select("hostname")
    .eq("id", domainId)
    .single();
  if (!domain) return;

  const result = await getDomainConfig(domain.hostname);

  if (result.configured) {
    await supabase
      .from("domains")
      .update({
        domain_status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("id", domainId);
  }

  revalidatePath(domainPath(propertyId));
}

export async function retryVercelAction(
  propertyId: string,
  formData: FormData
) {
  const domainId = String(formData.get("domainId") ?? "");
  if (!domainId) return;

  const supabase = await createSupabaseServerClient();

  const { data: domain } = await supabase
    .from("domains")
    .select("hostname")
    .eq("id", domainId)
    .single();
  if (!domain) return;

  const result = await addDomainToVercel(domain.hostname);

  if (result.ok) {
    await supabase
      .from("domains")
      .update({
        domain_status: "pending_dns",
        dns_records: result.dnsRecords,
        vercel_error: null,
      })
      .eq("id", domainId);
  } else {
    await supabase
      .from("domains")
      .update({
        vercel_error: result.error,
      })
      .eq("id", domainId);
  }

  revalidatePath(domainPath(propertyId));
}

export async function updateDomainAction(
  propertyId: string,
  formData: FormData
) {
  const domainId = String(formData.get("domainId") ?? "");
  const hostname = String(formData.get("hostname") ?? "")
    .trim()
    .toLowerCase();
  const isPrimary = Boolean(formData.get("is_primary"));

  if (!domainId || !hostname) return;

  const supabase = await createSupabaseServerClient();

  // Fetch current domain to check if hostname changed
  const { data: current } = await supabase
    .from("domains")
    .select("hostname")
    .eq("id", domainId)
    .single();

  // If setting primary, unset others
  if (isPrimary) {
    const { error: unsetErr } = await supabase
      .from("domains")
      .update({ is_primary: false })
      .eq("property_id", propertyId)
      .neq("id", domainId);
    if (unsetErr) throw unsetErr;
  }

  if (current && current.hostname !== hostname) {
    // Hostname changed — remove old, add new on Vercel
    await removeDomainFromVercel(current.hostname);
    const result = await addDomainToVercel(hostname);

    if (result.ok) {
      await supabase
        .from("domains")
        .update({
          hostname,
          is_primary: isPrimary,
          domain_status: "pending_dns",
          dns_records: result.dnsRecords,
          vercel_error: null,
          verified_at: null,
        })
        .eq("id", domainId);
    } else {
      await supabase
        .from("domains")
        .update({
          hostname,
          is_primary: isPrimary,
          domain_status: "error",
          vercel_error: result.error,
          verified_at: null,
        })
        .eq("id", domainId);
    }
  } else {
    // Only is_primary changed
    await supabase
      .from("domains")
      .update({ hostname, is_primary: isPrimary })
      .eq("id", domainId);
  }

  revalidatePath(domainPath(propertyId));
}
