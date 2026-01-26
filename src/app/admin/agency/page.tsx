import Link from "next/link";
import { requireMembership } from "@/lib/authz";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AgencyDashboard() {
  const membership = await requireMembership();
  if (membership.role !== "agency_admin") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <AdminHeader />
        <h1 className="text-2xl font-semibold">Agency</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <AdminHeader title="Agency Dashboard" />
      <p className="mt-2 text-sm text-zinc-600">
        Manage tenants, users, properties, and domains.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/agency/tenants"
          className="rounded-lg border p-4 hover:bg-zinc-50"
        >
          <h2 className="font-semibold">Tenants</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Manage tenant organizations and their properties
          </p>
        </Link>

        <Link
          href="/admin/agency/users"
          className="rounded-lg border p-4 hover:bg-zinc-50"
        >
          <h2 className="font-semibold">Users</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Manage user memberships and roles
          </p>
        </Link>
      </div>
    </div>
  );
}
