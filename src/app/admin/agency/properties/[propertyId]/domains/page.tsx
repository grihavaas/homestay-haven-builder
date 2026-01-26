import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DomainsManager } from "./DomainsManager";

async function getProperty(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id,tenant_id,name,slug,is_published")
    .eq("id", propertyId)
    .single();
  if (error) throw error;
  return data;
}

async function listDomains(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("domains")
    .select("id,hostname,is_primary,verified_at,created_at")
    .eq("property_id", propertyId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export default async function AgencyPropertyDomainsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const membership = await requireMembership();
  if (membership.role !== "agency_admin") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Domains</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const { propertyId } = await params;
  const property = await getProperty(propertyId);
  const domains = await listDomains(propertyId);

  async function addDomain(formData: FormData) {
    "use server";
    const hostname = String(formData.get("hostname") ?? "")
      .trim()
      .toLowerCase();
    const isPrimary = Boolean(formData.get("is_primary"));
    if (!hostname) return;

    const supabase = await createSupabaseServerClient();

    // If setting primary, unset others for this property.
    if (isPrimary) {
      const { error: unsetErr } = await supabase
        .from("domains")
        .update({ is_primary: false })
        .eq("property_id", propertyId);
      if (unsetErr) throw unsetErr;
    }

    const { error } = await supabase.from("domains").insert({
      tenant_id: property.tenant_id,
      property_id: propertyId,
      hostname,
      is_primary: isPrimary,
      // For now we allow manual verification; automation comes later.
      verified_at: new Date().toISOString(),
    });
    if (error) throw error;
    revalidatePath(`/admin/agency/properties/${propertyId}/domains`);
  }

  async function updateDomain(formData: FormData) {
    "use server";
    const domainId = String(formData.get("domainId") ?? "");
    const hostname = String(formData.get("hostname") ?? "")
      .trim()
      .toLowerCase();
    const isPrimary = Boolean(formData.get("is_primary"));
    
    if (!domainId || !hostname) return;

    const supabase = await createSupabaseServerClient();

    // If setting primary, unset others for this property.
    if (isPrimary) {
      const { error: unsetErr } = await supabase
        .from("domains")
        .update({ is_primary: false })
        .eq("property_id", propertyId)
        .neq("id", domainId);
      if (unsetErr) throw unsetErr;
    }

    const { error } = await supabase
      .from("domains")
      .update({
        hostname,
        is_primary: isPrimary,
      })
      .eq("id", domainId);
    if (error) throw error;
    revalidatePath(`/admin/agency/properties/${propertyId}/domains`);
  }

  async function deleteDomain(formData: FormData) {
    "use server";
    const domainId = String(formData.get("domainId") ?? "");
    if (!domainId) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("domains")
      .delete()
      .eq("id", domainId);
    if (error) throw error;
    revalidatePath(`/admin/agency/properties/${propertyId}/domains`);
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Domains</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Property: <span className="font-medium">{property.name}</span>{" "}
            <span className="font-mono text-xs text-zinc-500">
              ({property.slug})
            </span>
          </p>
        </div>
        <Link className="underline" href="/admin/agency/tenants">
          Back to tenants
        </Link>
      </div>

      <form action={addDomain} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          name="hostname"
          placeholder="example.com or www.example.com"
          className="flex-1 rounded-md border px-3 py-2 font-mono"
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input name="is_primary" type="checkbox" />
          Primary
        </label>
        <button className="rounded-md bg-black px-3 py-2 text-white">
          Add domain
        </button>
      </form>

      <DomainsManager
        domains={domains}
        updateDomain={updateDomain}
        deleteDomain={deleteDomain}
      />
    </div>
  );
}
