import Link from "next/link";
import { revalidatePath } from "next/cache";

import { getMemberships, requireUser } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteTenantButton } from "@/app/admin/(authenticated)/agency/tenants/DeleteTenantButton";

async function getTenantsForIds(tenantIds: string[]) {
  if (tenantIds.length === 0) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name,primary_contact_email,is_active,created_at,is_agency_tenant")
    .in("id", tenantIds)
    .order("name");
  if (error) throw error;
  return (data ?? []).filter((t) => !t.is_agency_tenant);
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
      <div>
        <h1 className="text-2xl font-semibold">RM Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const tenantIds = memberships.filter((m) => m.role === "agency_rm").map((m) => m.tenant_id);
  const [tenants, propertyCounts] = await Promise.all([
    getTenantsForIds(tenantIds),
    getPropertyCountByTenant(tenantIds),
  ]);

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
    <div>
      <h1 className="text-2xl font-semibold">My Customers</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {tenants.length} customer{tenants.length !== 1 ? "s" : ""} you manage.
        Create a customer, then open it to add properties.
      </p>

      {/* Create customer form */}
      <form action={createTenant} className="mt-6 rounded-lg border bg-white p-4">
        <h3 className="text-sm font-medium text-zinc-700">Add customer</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            name="name"
            placeholder="Customer name"
            className="rounded-md border px-3 py-2 text-sm"
            required
          />
          <input
            name="primary_contact_name"
            placeholder="Contact name (optional)"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            name="primary_contact_email"
            placeholder="Contact email (optional)"
            type="email"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            name="primary_contact_phone"
            placeholder="Contact phone (optional)"
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton pendingText="Creating..." className="mt-3">Create customer</SubmitButton>
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
          {tenants.map((tenant) => (
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
          {tenants.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              No customers yet. Create one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
