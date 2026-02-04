import Link from "next/link";
import { revalidatePath } from "next/cache";

import { getMemberships, requireUser } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { DeleteTenantButton } from "@/app/admin/agency/tenants/DeleteTenantButton";

async function getTenantsForIds(tenantIds: string[]) {
  if (tenantIds.length === 0) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name,primary_contact_email,is_active,created_at,is_agency_tenant")
    .in("id", tenantIds)
    .order("name");
  if (error) throw error;
  const rows = data ?? [];
  // Exclude agency tenant so RM dashboard only shows client tenants they can fully manage
  return rows.filter((t) => !t.is_agency_tenant);
}

async function getPropertyCountByTenant(tenantIds: string[]) {
  if (tenantIds.length === 0) return {} as Record<string, number>;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("tenant_id")
    .in("tenant_id", tenantIds);
  if (error) return {} as Record<string, number>;
  const counts: Record<string, number> = {};
  tenantIds.forEach((id) => (counts[id] = 0));
  (data ?? []).forEach((p) => {
    counts[p.tenant_id] = (counts[p.tenant_id] ?? 0) + 1;
  });
  return counts;
}

export default async function RMDashboardPage() {
  await requireUser();
  const memberships = await getMemberships();

  if (memberships.every((m) => m.role !== "agency_rm")) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <AdminHeader />
        <h1 className="text-2xl font-semibold">RM Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied. Relationship managers only.</p>
      </div>
    );
  }

  const tenantIds = memberships.filter((m) => m.role === "agency_rm").map((m) => m.tenant_id);
  const tenants = await getTenantsForIds(tenantIds);
  const propertyCounts = await getPropertyCountByTenant(tenantIds);

  async function createTenant(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const primary_contact_name = String(formData.get("primary_contact_name") ?? "").trim() || null;
    const primary_contact_email = String(formData.get("primary_contact_email") ?? "").trim() || null;
    const primary_contact_phone = String(formData.get("primary_contact_phone") ?? "").trim() || null;
    if (!name) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").insert({
      name,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
    });
    if (error) throw error;
    revalidatePath("/admin/rm");
  }

  async function deleteTenant(formData: FormData) {
    "use server";
    const tenantId = String(formData.get("tenantId"));
    if (!tenantId) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").delete().eq("id", tenantId);
    if (error) throw error;
    revalidatePath("/admin/rm");
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <AdminHeader title="Managed Tenants" />

      <h1 className="text-2xl font-semibold">Managed tenants</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Tenants you manage. Create a tenant, then open it to add properties and data.
      </p>

      <form action={createTenant} className="mt-6 grid gap-2 rounded-lg border p-4 sm:grid-cols-2">
        <h2 className="text-sm font-medium sm:col-span-2">Create tenant</h2>
        <input
          name="name"
          placeholder="Tenant name"
          className="rounded-md border px-3 py-2"
          required
        />
        <input
          name="primary_contact_name"
          placeholder="Primary contact name (optional)"
          className="rounded-md border px-3 py-2"
        />
        <input
          name="primary_contact_email"
          placeholder="Primary contact email (optional)"
          className="rounded-md border px-3 py-2"
        />
        <input
          name="primary_contact_phone"
          placeholder="Primary contact phone (optional)"
          className="rounded-md border px-3 py-2"
        />
        <button className="rounded-md bg-black px-3 py-2 text-white sm:col-span-2 sm:justify-self-start">
          Create tenant
        </button>
      </form>

      <div className="mt-8 rounded-lg border">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
          <div>Tenant</div>
          <div>Properties</div>
          <div>Actions</div>
          <div />
        </div>
        <div className="divide-y">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-2 p-3 text-sm items-center"
            >
              <div>
                <div className="font-medium">{tenant.name}</div>
                <div className="mt-1 font-mono text-xs text-zinc-500">{tenant.id}</div>
                {tenant.primary_contact_email && (
                  <div className="mt-1 text-xs text-zinc-600">{tenant.primary_contact_email}</div>
                )}
              </div>
              <div className="text-zinc-600">{propertyCounts[tenant.id] ?? 0}</div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/agency/tenants/${tenant.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Manage
                </Link>
                <Link
                  href={`/admin/agency/tenants/${tenant.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Properties
                </Link>
              </div>
              <div>
                <DeleteTenantButton
                  tenantId={tenant.id}
                  tenantName={tenant.name}
                  deleteAction={deleteTenant}
                />
              </div>
            </div>
          ))}
          {tenants.length === 0 ? (
            <div className="p-3 text-sm text-zinc-600">No tenants yet. Create one above.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
