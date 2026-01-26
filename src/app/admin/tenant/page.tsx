import { requireMembership } from "@/lib/authz";
import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";

export default async function TenantDashboard() {
  const membership = await requireMembership();
  if (membership.role === "agency_admin") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <AdminHeader />
        <h1 className="text-2xl font-semibold">Tenant dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">
          You are an agency admin. Use the Agency dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <AdminHeader title="Tenant Dashboard" />
      <p className="mt-2 text-sm text-zinc-600">
        Tenant: <span className="font-mono">{membership.tenant_id}</span>
      </p>
      <div className="mt-6 flex flex-col gap-2 text-sm">
        <Link className="underline" href="/admin/properties">
          Manage properties
        </Link>
      </div>
    </div>
  );
}

