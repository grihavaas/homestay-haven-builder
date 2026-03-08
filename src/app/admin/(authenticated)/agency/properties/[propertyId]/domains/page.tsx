import Link from "next/link";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DomainsManager } from "./DomainsManager";
import {
  addDomainAction,
  updateDomainAction,
  deleteDomainAction,
  verifyDomainAction,
  retryVercelAction,
} from "./actions";

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
    .select(
      "id,hostname,is_primary,verified_at,created_at,domain_status,dns_records,vercel_error"
    )
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
  const { propertyId } = await params;
  const property = await getProperty(propertyId);
  const membership = await requireMembership(property.tenant_id);
  const canAccess =
    membership.role === "agency_admin" || membership.role === "agency_rm";
  if (!canAccess) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Domains</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }
  const domains = await listDomains(propertyId);

  const boundAddDomain = addDomainAction.bind(
    null,
    propertyId,
    property.tenant_id
  );
  const boundUpdateDomain = updateDomainAction.bind(null, propertyId);
  const boundDeleteDomain = deleteDomainAction.bind(null, propertyId);
  const boundVerifyDomain = verifyDomainAction.bind(null, propertyId);
  const boundRetryVercel = retryVercelAction.bind(null, propertyId);

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

      <form
        action={boundAddDomain}
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
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
        updateDomain={boundUpdateDomain}
        deleteDomain={boundDeleteDomain}
        verifyDomain={boundVerifyDomain}
        retryVercel={boundRetryVercel}
      />
    </div>
  );
}
