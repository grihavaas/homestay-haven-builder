import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteTenantButton } from "./DeleteTenantButton";

async function listTenants() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name,primary_contact_email,is_active,is_agency_tenant,created_at")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

async function getPropertyCounts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("tenant_id");
  if (error) return {} as Record<string, number>;
  const counts: Record<string, number> = {};
  (data ?? []).forEach((p) => {
    counts[p.tenant_id] = (counts[p.tenant_id] ?? 0) + 1;
  });
  return counts;
}

export default async function AgencyTenantsPage() {
  const membership = await requireMembership();
  if (membership.role !== "agency_admin") {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const [tenants, propertyCounts] = await Promise.all([
    listTenants(),
    getPropertyCounts(),
  ]);

  async function createTenant(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("primary_contact_email") ?? "").trim();
    if (!name) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").insert({
      name,
      primary_contact_email: email || null,
    });
    if (error) throw error;
    revalidatePath("/admin/agency/tenants");
  }

  async function deleteTenant(formData: FormData) {
    "use server";
    const tenantId = String(formData.get("tenantId"));
    if (!tenantId) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").delete().eq("id", tenantId);
    if (error) throw error;
    revalidatePath("/admin/agency/tenants");
  }

  // Separate agency tenant from regular tenants
  const agencyTenant = tenants.find((t) => t.is_agency_tenant);
  const customerTenants = tenants.filter((t) => !t.is_agency_tenant);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {customerTenants.length} customer{customerTenants.length !== 1 ? "s" : ""}
      </p>

      {/* Create tenant form */}
      <form action={createTenant} className="mt-6 rounded-lg border bg-white p-4">
        <h3 className="text-sm font-medium text-zinc-700">Add customer</h3>
        <div className="mt-3 flex gap-2">
          <input
            name="name"
            placeholder="Customer name"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            required
          />
          <input
            name="primary_contact_email"
            placeholder="Contact email (optional)"
            type="email"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Create
          </button>
        </div>
      </form>

      {/* Customer list */}
      <div className="mt-6 rounded-lg border bg-white">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600">
          <div>Customer</div>
          <div>Properties</div>
          <div>Status</div>
          <div></div>
        </div>
        <div className="divide-y">
          {customerTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 text-sm items-center"
            >
              <div>
                <Link
                  href={`/admin/agency/tenants/${tenant.id}`}
                  className="font-medium text-zinc-900 hover:text-blue-600"
                >
                  {tenant.name}
                </Link>
                {tenant.primary_contact_email && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {tenant.primary_contact_email}
                  </p>
                )}
              </div>
              <div className="text-zinc-600 tabular-nums">
                {propertyCounts[tenant.id] ?? 0}
              </div>
              <div>
                {tenant.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/agency/tenants/${tenant.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Manage
                </Link>
                <DeleteTenantButton
                  tenantId={tenant.id}
                  tenantName={tenant.name}
                  deleteAction={deleteTenant}
                />
              </div>
            </div>
          ))}
          {customerTenants.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              No customers yet. Create one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
