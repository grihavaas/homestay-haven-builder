import Link from "next/link";
import { redirect } from "next/navigation";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getTenantName(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tenants")
    .select("name")
    .eq("id", tenantId)
    .single();
  return data?.name ?? "Your Organization";
}

async function listProperties(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id,name,slug,city,country,is_published")
    .eq("tenant_id", tenantId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export default async function TenantDashboard() {
  const membership = await requireMembership();

  if (membership.role === "agency_admin") {
    redirect("/admin/agency");
  }
  if (membership.role === "agency_rm") {
    redirect("/admin/rm");
  }

  const [tenantName, properties] = await Promise.all([
    getTenantName(membership.tenant_id),
    listProperties(membership.tenant_id),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">{tenantName}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {properties.length} propert{properties.length !== 1 ? "ies" : "y"}
      </p>

      {/* Quick links */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/properties"
          className="rounded-lg border bg-white px-4 py-3 text-sm font-medium hover:border-zinc-300 hover:shadow-sm transition-all"
        >
          Manage Properties
        </Link>
        {membership.role === "tenant_admin" && (
          <Link
            href="/admin/tenant/members"
            className="rounded-lg border bg-white px-4 py-3 text-sm font-medium hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            Manage Members
          </Link>
        )}
      </div>

      {/* Properties list */}
      <div className="mt-8 rounded-lg border bg-white">
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
              No properties yet.{" "}
              <Link href="/admin/properties" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
