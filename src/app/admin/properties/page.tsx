import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
// import { OTAImportForm } from "@/components/OTAImportForm"; // Temporarily disabled
import { JSONImportForm } from "@/components/JSONImportForm";

async function listProperties(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id,name,slug,city,country,is_published,updated_at,import_summary")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export default async function TenantPropertiesPage() {
  const membership = await requireMembership();
  if (membership.role === "agency_admin") {
    // Agency admins use Agency area for cross-tenant management
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Agency admins should manage properties from the Agency area.
        </p>
      </div>
    );
  }

  const properties = await listProperties(membership.tenant_id);

  async function createProperty(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const country = String(formData.get("country") ?? "").trim();
    if (!name || !slug || !country) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("properties").insert({
      tenant_id: membership.tenant_id,
      name,
      slug,
      country,
      is_published: false,
      is_active: true,
    });
    if (error) throw error;
    revalidatePath("/admin/properties");
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <AdminHeader title="Your Properties" />

      {/* OTA Import temporarily disabled */}
      {/* <OTAImportForm tenantId={membership.tenant_id} /> */}

      <JSONImportForm tenantId={membership.tenant_id} />

      {/* tenant_editor: edit only, no create */}
      {membership.role !== "tenant_editor" && (
      <form action={createProperty} className="mt-6 grid gap-2 sm:grid-cols-3">
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
          Create
        </button>
      </form>
      )}

      <div className="mt-8 rounded-lg border">
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
                <Link className="underline" href={`/admin/properties/${p.id}`}>
                  {p.name}
                </Link>
                <div className="mt-1 font-mono text-xs text-zinc-500">{p.id}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {p.city ? `${p.city}, ` : ""}
                  {p.country}
                </div>
                {p.import_summary && (
                  <div className="mt-2 rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-900">
                    <div className="font-medium mb-1">Import Summary:</div>
                    <div className="text-blue-800">{p.import_summary}</div>
                  </div>
                )}
              </div>
              <div className="font-mono">{p.slug}</div>
              <div>{p.is_published ? "yes" : "no"}</div>
            </div>
          ))}
          {properties.length === 0 ? (
            <div className="p-3 text-sm text-zinc-600">
              No properties yet. Create one above.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

