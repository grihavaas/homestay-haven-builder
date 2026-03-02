import { redirect } from "next/navigation";
import { getMemberships, requireUser } from "@/lib/authz";

export default async function AdminHome() {
  await requireUser();
  const memberships = await getMemberships();

  if (memberships.length === 0) {
    redirect("/admin/login?error=no_membership");
  }

  const role = memberships[0].role;

  if (role === "agency_admin") {
    redirect("/admin/agency");
  } else if (role === "agency_rm") {
    redirect("/admin/rm");
  } else {
    redirect("/admin/tenant");
  }
}
