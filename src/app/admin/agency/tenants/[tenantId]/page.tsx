import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteTenantButton } from "../DeleteTenantButton";

async function getTenant(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name,primary_contact_email,is_active")
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
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Tenant</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const tenant = await getTenant(tenantId);
  const properties = await listProperties(tenantId);

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
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{tenant.name}</h1>
          <div className="mt-1 font-mono text-xs text-zinc-500">{tenant.id}</div>
        </div>
        <div className="flex items-center gap-3">
          <Link className="underline" href={backHref}>
            Back to tenants
          </Link>
          <DeleteTenantButton
            tenantId={tenant.id}
            tenantName={tenant.name}
            deleteAction={deleteTenant}
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-4 text-sm">
        <div>
          <span className="font-medium">Primary contact email:</span>{" "}
          {tenant.primary_contact_email ?? "—"}
        </div>
        <div className="mt-1">
          <span className="font-medium">Status:</span>{" "}
          {tenant.is_active ? "active" : "inactive"}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Create property</h2>
      <form action={createProperty} className="mt-3 grid gap-2 sm:grid-cols-3">
        <input
          name="name"
          placeholder="Property name"
          className="rounded-md border px-3 py-2"
          required
        />
        <input
          name="slug"
          placeholder="slug (unique)"
          className="rounded-md border px-3 py-2 font-mono"
          required
        />
        <input
          name="country"
          placeholder="Country"
          className="rounded-md border px-3 py-2"
          required
        />
        <button className="rounded-md bg-black px-3 py-2 text-white sm:col-span-3 sm:justify-self-start">
          Create property
        </button>
      </form>

      <h2 className="mt-10 text-lg font-semibold">Properties</h2>
      <div className="mt-3 rounded-lg border">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
          <div>Name</div>
          <div>Slug</div>
          <div>Published</div>
        </div>
        <div className="divide-y">
          {properties.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 p-3 text-sm"
            >
              <div>
                {p.name}
                <div className="mt-1 font-mono text-xs text-zinc-500">{p.id}</div>
                <div className="mt-1">
                  <Link className="underline" href={`/admin/agency/properties/${p.id}/domains`}>
                    Manage domains
                  </Link>
                </div>
              </div>
              <div className="font-mono">{p.slug}</div>
              <div>{p.is_published ? "yes" : "no"}</div>
            </div>
          ))}
          {properties.length === 0 ? (
            <div className="p-3 text-sm text-zinc-600">No properties yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

