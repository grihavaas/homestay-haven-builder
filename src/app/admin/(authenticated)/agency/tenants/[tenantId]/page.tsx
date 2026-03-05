import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/SubmitButton";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DeleteTenantButton } from "../DeleteTenantButton";

async function getTenant(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name,primary_contact_name,primary_contact_email,primary_contact_phone,is_active,is_agency_tenant")
    .eq("id", tenantId)
    .single();
  if (error) throw error;
  return data;
}

async function listProperties(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id,name,slug,is_published,created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listMembers(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("id,user_id,role,created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Resolve user display names
  try {
    const adminClient = createSupabaseAdminClient();
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const userMap: Record<string, string> = {};
    usersData?.users.forEach((u) => {
      const name = [u.user_metadata?.first_name, u.user_metadata?.last_name]
        .filter(Boolean)
        .join(" ");
      userMap[u.id] = name || u.email || u.phone || u.id.substring(0, 8) + "...";
    });
    return (data ?? []).map((m) => ({
      ...m,
      displayName: userMap[m.user_id] ?? m.user_id.substring(0, 8) + "...",
    }));
  } catch {
    return (data ?? []).map((m) => ({
      ...m,
      displayName: m.user_id.substring(0, 8) + "...",
    }));
  }
}

export default async function AgencyTenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const membership = await requireMembership(tenantId);
  const canAccess =
    membership.role === "agency_admin" || membership.role === "agency_rm";
  if (!canAccess) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Customer</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const [tenant, properties, members] = await Promise.all([
    getTenant(tenantId),
    listProperties(tenantId),
    listMembers(tenantId),
  ]);

  async function deleteTenant(formData: FormData) {
    "use server";
    const id = String(formData.get("tenantId"));
    if (!id) return;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/agency/tenants");
    revalidatePath("/admin/rm");
    redirect("/admin/agency/tenants");
  }

  async function createProperty(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const country = String(formData.get("country") ?? "").trim();
    if (!name || !slug || !country) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("properties").insert({
      tenant_id: tenantId,
      name,
      slug,
      country,
      is_published: false,
      is_active: true,
    });
    if (error) throw error;
    revalidatePath(`/admin/agency/tenants/${tenantId}`);
  }

  const backHref =
    membership.role === "agency_rm" ? "/admin/rm" : "/admin/agency/tenants";

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-500 mb-4">
        <Link href={backHref} className="hover:text-zinc-700">
          {membership.role === "agency_rm" ? "My Customers" : "Customers"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{tenant.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{tenant.name}</h1>
          <div className="mt-1 flex items-center gap-3">
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
        </div>
        {membership.role === "agency_admin" && (
          <DeleteTenantButton
            tenantId={tenant.id}
            tenantName={tenant.name}
            deleteAction={deleteTenant}
          />
        )}
      </div>

      {/* Contact info */}
      <div className="mt-6 rounded-lg border bg-white p-4">
        <h2 className="text-sm font-medium text-zinc-700">Contact Information</h2>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <span className="text-zinc-500">Name:</span>{" "}
            <span className="text-zinc-900">
              {(tenant as any).primary_contact_name ?? "---"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Email:</span>{" "}
            <span className="text-zinc-900">
              {tenant.primary_contact_email ?? "---"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Phone:</span>{" "}
            <span className="text-zinc-900">
              {(tenant as any).primary_contact_phone ?? "---"}
            </span>
          </div>
        </div>
      </div>

      {/* Properties section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Properties ({properties.length})
          </h2>
        </div>

        <form action={createProperty} className="mt-4 rounded-lg border bg-white p-4">
          <h3 className="text-sm font-medium text-zinc-700">Add property</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <input
              name="name"
              placeholder="Property name"
              className="rounded-md border px-3 py-2 text-sm"
              required
            />
            <input
              name="slug"
              placeholder="slug (unique)"
              className="rounded-md border px-3 py-2 text-sm font-mono"
              required
            />
            <input
              name="country"
              placeholder="Country"
              className="rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          <SubmitButton pendingText="Creating..." className="mt-3">Create property</SubmitButton>
        </form>

        <div className="mt-4 rounded-lg border bg-white">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600">
            <div>Name</div>
            <div>Slug</div>
            <div>Status</div>
            <div></div>
          </div>
          <div className="divide-y">
            {properties.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 text-sm items-center"
              >
                <div>
                  <Link
                    href={`/admin/properties/${p.id}`}
                    className="font-medium text-zinc-900 hover:text-blue-600"
                  >
                    {p.name}
                  </Link>
                </div>
                <div className="font-mono text-zinc-500 text-xs">{p.slug}</div>
                <div>
                  {p.is_published ? (
                    <span className="text-green-600 text-xs">Published</span>
                  ) : (
                    <span className="text-zinc-400 text-xs">Draft</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/properties/${p.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/agency/properties/${p.id}/domains`}
                    className="text-xs text-zinc-600 hover:underline"
                  >
                    Domains
                  </Link>
                </div>
              </div>
            ))}
            {properties.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-zinc-500">
                No properties yet. Create one above.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Members ({members.length})</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Users who have access to this customer.
        </p>
        <div className="mt-4 rounded-lg border bg-white">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600">
            <div>User</div>
            <div>Role</div>
          </div>
          <div className="divide-y">
            {members.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 text-sm items-center"
              >
                <div className="text-zinc-900">{m.displayName}</div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-zinc-500">
                No members assigned.{" "}
                {membership.role === "agency_admin" && (
                  <Link
                    href="/admin/agency/users"
                    className="text-blue-600 hover:underline"
                  >
                    Go to User Management
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
