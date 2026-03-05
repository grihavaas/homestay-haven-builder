import { redirect } from "next/navigation";
import { getMemberships, requireUser } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/AdminSidebar";
import type { Role } from "@/lib/authz";

async function getTenantsForIds(tenantIds: string[]) {
  if (tenantIds.length === 0) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tenants")
    .select("id,name,is_agency_tenant")
    .in("id", tenantIds)
    .order("name");
  return (data ?? []).filter((t) => !t.is_agency_tenant);
}

async function getTenantName(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tenants")
    .select("id,name")
    .eq("id", tenantId)
    .single();
  return data;
}

export default async function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const memberships = await getMemberships();

  if (memberships.length === 0) {
    redirect("/admin/login?error=no_membership");
  }

  // Determine primary role — prioritize agency roles over tenant roles
  const rolePriority: Record<string, number> = {
    agency_admin: 0,
    agency_rm: 1,
    tenant_admin: 2,
    tenant_editor: 3,
  };
  const sorted = [...memberships].sort(
    (a, b) => (rolePriority[a.role] ?? 9) - (rolePriority[b.role] ?? 9),
  );
  const primary = sorted[0];
  const role = primary.role as Role;

  // Build tenant list for sidebar
  let tenants: { id: string; name: string }[] = [];
  if (role === "agency_rm") {
    const tenantIds = memberships
      .filter((m) => m.role === "agency_rm")
      .map((m) => m.tenant_id);
    tenants = await getTenantsForIds(tenantIds);
  } else if (role === "tenant_admin" || role === "tenant_editor") {
    const t = await getTenantName(primary.tenant_id);
    if (t) tenants = [t];
  }

  const userEmail = user.email || user.phone || "Unknown";

  return (
    <div data-admin className="min-h-screen bg-zinc-50 text-zinc-900">
      <AdminSidebar
        role={role}
        memberships={memberships}
        userEmail={userEmail}
        tenants={tenants}
      />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
