import Link from "next/link";
import { requireMembership, requireUser } from "@/lib/authz";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminHome() {
  const user = await requireUser();
  const membership = await requireMembership();

  return (
    <div className="mx-auto max-w-3xl p-8">
      <AdminHeader />
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Signed in as <span className="font-mono">{user.email}</span>
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        Role: <span className="font-mono">{membership.role}</span>
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {membership.role === "agency_admin" ? (
          <Link className="underline" href="/admin/agency">
            Go to Agency dashboard
          </Link>
        ) : (
          <Link className="underline" href="/admin/tenant">
            Go to Tenant dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
