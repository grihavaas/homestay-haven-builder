import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function getTenantName(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tenants")
    .select("name")
    .eq("id", tenantId)
    .single();
  return data?.name ?? "Your Organization";
}

async function listMembers(tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("id,user_id,role,created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  try {
    const adminClient = createSupabaseAdminClient();
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const userMap: Record<string, string> = {};
    usersData?.users.forEach((u) => {
      const name = [u.user_metadata?.first_name, u.user_metadata?.last_name]
        .filter(Boolean)
        .join(" ");
      userMap[u.id] = name || u.email || u.phone || u.id.substring(0, 8) + "...";
    });
    return (data ?? []).map((m) => ({
      ...m,
      displayName: userMap[m.user_id] ?? m.user_id.substring(0, 8) + "...",
    }));
  } catch {
    return (data ?? []).map((m) => ({
      ...m,
      displayName: m.user_id.substring(0, 8) + "...",
    }));
  }
}

export default async function TenantMembersPage() {
  const membership = await requireMembership();

  // Only tenant_admin can manage members
  if (membership.role !== "tenant_admin") {
    redirect("/admin/tenant");
  }

  const [tenantName, members] = await Promise.all([
    getTenantName(membership.tenant_id),
    listMembers(membership.tenant_id),
  ]);

  async function removeMember(formData: FormData) {
    "use server";
    const membershipId = String(formData.get("membershipId") ?? "").trim();
    if (!membershipId) return;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("tenant_memberships")
      .delete()
      .eq("id", membershipId);
    if (error) throw error;
    revalidatePath("/admin/tenant/members");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Members</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Users who have access to {tenantName}.
      </p>

      <div className="mt-6 rounded-lg border bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600">
          <div>User</div>
          <div>Role</div>
          <div></div>
        </div>
        <div className="divide-y">
          {members.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-sm items-center"
            >
              <div className="text-zinc-900">{m.displayName}</div>
              <div>
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                  {m.role}
                </span>
              </div>
              <div>
                {m.role !== "tenant_admin" && (
                  <form action={removeMember} className="inline">
                    <input type="hidden" name="membershipId" value={m.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              No members found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
