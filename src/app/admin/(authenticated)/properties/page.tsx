import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    return (
      <div>
        <h1 className="text-2xl font-semibold">Properties</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Agency admins should manage properties from the{" "}
          <Link href="/admin/agency/tenants" className="text-blue-600 hover:underline">
            Customers
          </Link>{" "}
          area.
        </p>
      </div>
    );
  }

  const properties = await listProperties(membership.tenant_id);
  const canCreate = membership.role !== "tenant_editor";

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
    <div>
      <h1 className="text-2xl font-semibold">Properties</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {properties.length} propert{properties.length !== 1 ? "ies" : "y"}
      </p>

      {canCreate && <JSONImportForm tenantId={membership.tenant_id} />}

      {canCreate && (
        <form action={createProperty} className="mt-6 rounded-lg border bg-white p-4">
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
          <button className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Create
          </button>
        </form>
      )}

      <div className="mt-6 rounded-lg border bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600">
          <div>Property</div>
          <div>Location</div>
          <div>Status</div>
        </div>
        <div className="divide-y">
          {properties.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-sm items-center"
            >
              <div>
                <Link
                  href={`/admin/properties/${p.id}`}
                  className="font-medium text-zinc-900 hover:text-blue-600"
                >
                  {p.name}
                </Link>
                <p className="mt-0.5 text-xs text-zinc-500 font-mono">{p.slug}</p>
                {p.import_summary && (
                  <div className="mt-2 rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-900">
                    <div className="font-medium mb-0.5">Import Summary:</div>
                    <div className="text-blue-800">{p.import_summary}</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {[p.city, p.country].filter(Boolean).join(", ") || "---"}
              </div>
              <div>
                {p.is_published ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    Draft
                  </span>
                )}
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              No properties yet.{canCreate ? " Create one above." : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
