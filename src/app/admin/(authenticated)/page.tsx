import { redirect } from "next/navigation";
import { getMemberships, requireUser } from "@/lib/authz";

const rolePriority: Record<string, number> = {
  agency_admin: 0,
  agency_rm: 1,
  tenant_admin: 2,
  tenant_editor: 3,
};

export default async function AdminHome() {
  await requireUser();
  const memberships = await getMemberships();

  if (memberships.length === 0) {
    redirect("/admin/login?error=no_membership");
  }

  // Pick highest-priority role
  const sorted = [...memberships].sort(
    (a, b) => (rolePriority[a.role] ?? 9) - (rolePriority[b.role] ?? 9),
  );
  const role = sorted[0].role;

  if (role === "agency_admin") {
    redirect("/admin/agency");
  } else if (role === "agency_rm") {
    redirect("/admin/rm");
  } else {
    redirect("/admin/tenant");
  }
}
