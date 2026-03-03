import Link from "next/link";
import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Building2, Users, Home } from "lucide-react";

async function getStats() {
  const supabase = await createSupabaseServerClient();
  const [tenantsRes, propertiesRes, membershipsRes] = await Promise.all([
    supabase.from("tenants").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("tenant_memberships").select("id", { count: "exact", head: true }),
  ]);
  return {
    tenants: tenantsRes.count ?? 0,
    properties: propertiesRes.count ?? 0,
    users: membershipsRes.count ?? 0,
  };
}

export default async function AgencyDashboard() {
  const membership = await requireMembership();
  if (membership.role !== "agency_admin") {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Agency</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Agency Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Manage customers, users, properties, and domains.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-blue-50 p-2">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.tenants}</p>
              <p className="text-sm text-zinc-500">Customers</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-green-50 p-2">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.properties}</p>
              <p className="text-sm text-zinc-500">Properties</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-purple-50 p-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.users}</p>
              <p className="text-sm text-zinc-500">User Memberships</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/agency/tenants"
          className="rounded-lg border bg-white p-5 hover:border-zinc-300 hover:shadow-sm transition-all"
        >
          <h2 className="font-semibold">Customers</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage customer organizations and their properties
          </p>
        </Link>
        <Link
          href="/admin/agency/users"
          className="rounded-lg border bg-white p-5 hover:border-zinc-300 hover:shadow-sm transition-all"
        >
          <h2 className="font-semibold">Users</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage user memberships and roles
          </p>
        </Link>
      </div>
    </div>
  );
}
