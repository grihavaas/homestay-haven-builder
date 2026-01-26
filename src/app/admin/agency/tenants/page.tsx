import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { DeleteTenantButton } from "./DeleteTenantButton";

async function listTenants() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name,is_active,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listAllProperties() {
  const supabase = await createSupabaseServerClient();
  
  // First, verify we're authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("No authenticated user:", userError);
    return [];
  }
  
  // Try a simpler query first to see if we can get properties at all
  const { data: propertiesData, error: propsError } = await supabase
    .from("properties")
    .select("id, name, slug, is_published, tenant_id, created_at")
    .order("created_at", { ascending: false });
    
  if (propsError) {
    console.error("Error fetching properties:", propsError);
    return [];
  }
  
  if (!propertiesData || propertiesData.length === 0) {
    console.log("No properties found in database");
    return [];
  }
  
  // Now get tenant info for each property
  const tenantIds = [...new Set(propertiesData.map(p => p.tenant_id).filter(Boolean))];
  const { data: tenantsData } = await supabase
    .from("tenants")
    .select("id, name")
    .in("id", tenantIds);
  
  const tenantMap = new Map((tenantsData || []).map(t => [t.id, t]));
  
  // Combine properties with tenant info
  const propertiesWithTenants = propertiesData.map(prop => ({
    ...prop,
    tenants: prop.tenant_id ? tenantMap.get(prop.tenant_id) || null : null,
  }));
  
  return propertiesWithTenants;
}

export default async function AgencyTenantsPage() {
  const membership = await requireMembership();
  if (membership.role !== "agency_admin") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Tenants</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const tenants = await listTenants();
  let allProperties: any[] = [];
  
  try {
    allProperties = await listAllProperties();
  } catch (error) {
    console.error("Failed to load properties:", error);
    // Continue with empty array if there's an error
  }
  
  // Create a map of tenant IDs to tenant names for fallback
  const tenantMap = new Map(tenants.map(t => [t.id, t.name]));
  
  // Group properties by tenant
  const propertiesByTenant = allProperties.reduce((acc, prop: any) => {
    const tenantId = prop.tenant_id;
    if (!tenantId) return acc;
    
    // Get tenant info from relation or fallback to map
    const tenantInfo = prop.tenants 
      ? { id: prop.tenants.id, name: prop.tenants.name }
      : { id: tenantId, name: tenantMap.get(tenantId) || 'Unknown Tenant' };
    
    if (!acc[tenantId]) {
      acc[tenantId] = {
        tenant: tenantInfo,
        properties: [],
      };
    }
    acc[tenantId].properties.push(prop);
    return acc;
  }, {} as Record<string, { tenant: { id: string; name: string }; properties: typeof allProperties }>);
  
  // Also include tenants that have no properties yet
  tenants.forEach(tenant => {
    if (!propertiesByTenant[tenant.id]) {
      propertiesByTenant[tenant.id] = {
        tenant: { id: tenant.id, name: tenant.name },
        properties: [],
      };
    }
  });

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

  return (
    <div className="mx-auto max-w-3xl p-8">
      <AdminHeader title="Tenants" />

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
        <p className="font-medium text-blue-900">Creating a tenant:</p>
        <p className="mt-1 text-blue-800">
          This creates the tenant organization. To give someone access, go to{" "}
          <Link href="/admin/agency/users" className="underline">User Management</Link>{" "}
          where you can create users and assign them to this tenant.
        </p>
      </div>

      <form action={createTenant} className="mt-6 flex gap-2">
        <input
          name="name"
          placeholder="Tenant name"
          className="flex-1 rounded-md border px-3 py-2"
          required
        />
        <input
          name="primary_contact_email"
          placeholder="Primary contact email (optional)"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button className="rounded-md bg-black px-3 py-2 text-white">
          Create Tenant
        </button>
      </form>

      {allProperties.length > 0 && (
        <div className="mt-4 text-xs text-zinc-500">
          Found {allProperties.length} property{allProperties.length !== 1 ? 'ies' : ''} across {Object.keys(propertiesByTenant).length} tenant{Object.keys(propertiesByTenant).length !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="mt-8 rounded-lg border">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
          <div>Property</div>
          <div>Slug</div>
          <div>Status</div>
          <div>Domains</div>
          <div>Actions</div>
        </div>
        <div className="divide-y">
          {(Object.values(propertiesByTenant) as Array<{ tenant: { id: string; name: string }; properties: typeof allProperties }>)
            .sort((a, b) => a.tenant.name.localeCompare(b.tenant.name))
            .map(({ tenant, properties }) => (
            <div key={`tenant-group-${tenant.id}`}>
              {/* Tenant Header Row */}
              <div className="bg-zinc-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-zinc-900">{tenant.name}</div>
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/admin/agency/tenants/${tenant.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Tenant details
                    </Link>
                    <DeleteTenantButton
                      tenantId={tenant.id}
                      tenantName={tenant.name}
                      deleteAction={deleteTenant}
                    />
                  </div>
                </div>
              </div>
              {/* Properties for this tenant */}
              {properties.length > 0 ? (
                properties.map((prop: any) => (
                  <div key={prop.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 p-3 text-sm pl-6">
                    <div>
                      <Link 
                        href={`/admin/properties/${prop.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        {prop.name}
                      </Link>
                      <div className="mt-1 font-mono text-xs text-zinc-500">{prop.id}</div>
                    </div>
                    <div className="font-mono text-zinc-600">{prop.slug}</div>
                    <div className="text-zinc-600">
                      {prop.is_published ? (
                        <span className="text-green-600">Published</span>
                      ) : (
                        <span className="text-zinc-400">Draft</span>
                      )}
                    </div>
                    <div>
                      <Link 
                        href={`/admin/agency/properties/${prop.id}/domains`}
                        className="text-xs text-zinc-600 hover:text-zinc-800 underline"
                      >
                        Domains
                      </Link>
                    </div>
                    <div>
                      <Link 
                        href={`/admin/properties/${prop.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-zinc-400 pl-6 italic">No properties yet</div>
              )}
            </div>
          ))}
          {Object.keys(propertiesByTenant).length === 0 ? (
            <div className="p-3 text-sm text-zinc-600">
              No tenants or properties found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

