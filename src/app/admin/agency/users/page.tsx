import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/AdminHeader";

async function listUsers() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("id,user_id,tenant_id,role,created_at,tenants(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const memberships = data ?? [];

  // Fetch user emails/phones using admin client (server-side only)
  try {
    const adminClient = createSupabaseAdminClient();
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const userInfo: Record<string, { email?: string; phone?: string }> = {};

    usersData?.users.forEach((user) => {
      userInfo[user.id] = {
        email: user.email || undefined,
        phone: user.phone || undefined,
      };
    });

    return memberships.map((m) => ({
      ...m,
      email: userInfo[m.user_id]?.email || undefined,
      phone: userInfo[m.user_id]?.phone || undefined,
      displayName:
        userInfo[m.user_id]?.email ||
        userInfo[m.user_id]?.phone ||
        m.user_id.substring(0, 8) + "...",
    }));
  } catch {
    // If admin client fails (e.g., no service role key), fall back to showing user_id
    return memberships.map((m) => ({
      ...m,
      email: undefined,
      phone: undefined,
      displayName: m.user_id.substring(0, 8) + "...",
    }));
  }
}

async function listTenants() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export default async function AgencyUsersPage() {
  const membership = await requireMembership();
  if (membership.role !== "agency_admin") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const [users, tenants] = await Promise.all([listUsers(), listTenants()]);

  async function createUserAndMembership(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim() || undefined;
    const phone = String(formData.get("phone") ?? "").trim() || undefined;
    const password = String(formData.get("password") ?? "").trim() || undefined;
    const tenantId = String(formData.get("tenant_id") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const sendInvite = Boolean(formData.get("send_invite"));

    // Require at least email or phone
    if ((!email && !phone) || !tenantId || !role) return;

    // Use admin client for user creation (server-side only)
    const adminClient = createSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => {
      if (email && u.email === email) return true;
      if (phone && u.phone === phone) return true;
      return false;
    });

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      if (phone && !email) {
        // Phone-only user creation
        const { data: userData, error: userError } =
          await adminClient.auth.admin.createUser({
            phone,
            phone_confirm: true, // Auto-confirm phone
            user_metadata: { tenant_id: tenantId },
          });
        if (userError) throw userError;
        userId = userData.user.id;
      } else if (sendInvite && email) {
        // Send invitation email (user sets their own password)
        const { data: inviteData, error: inviteError } =
          await adminClient.auth.admin.inviteUserByEmail(email, {
            data: { tenant_id: tenantId },
          });
        if (inviteError) throw inviteError;
        userId = inviteData.user.id;
      } else if (password && email) {
        // Create user with email/password (optionally with phone too)
        const userCreateData: {
          email: string;
          password: string;
          email_confirm: boolean;
          phone?: string;
          phone_confirm?: boolean;
          user_metadata: { tenant_id: string };
        } = {
          email,
          password,
          email_confirm: true,
          user_metadata: { tenant_id: tenantId },
        };

        if (phone) {
          userCreateData.phone = phone;
          userCreateData.phone_confirm = true;
        }

        const { data: userData, error: userError } =
          await adminClient.auth.admin.createUser(userCreateData);
        if (userError) throw userError;
        userId = userData.user.id;
      } else {
        throw new Error(
          "For email users: provide password or 'send invitation'. For phone-only users: just provide phone number."
        );
      }
    }

    // Create membership
    const { error } = await supabase.from("tenant_memberships").insert({
      tenant_id: tenantId,
      user_id: userId,
      role,
    });

    if (error) {
      // If membership already exists, update it
      if (error.code === "23505") {
        const { error: updateError } = await supabase
          .from("tenant_memberships")
          .update({ role })
          .eq("tenant_id", tenantId)
          .eq("user_id", userId);
        if (updateError) throw updateError;
      } else {
        throw error;
      }
    }

    revalidatePath("/admin/agency/users");
  }

  async function deleteMembership(membershipId: string) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("tenant_memberships")
      .delete()
      .eq("id", membershipId);
    if (error) throw error;
    revalidatePath("/admin/agency/users");
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <AdminHeader title="User Management" />

      <form
        action={createUserAndMembership}
        className="mt-6 space-y-4 rounded-lg border p-4"
      >
        <h3 className="font-medium">Create User & Assign to Tenant</h3>
        <p className="text-sm text-zinc-600">
          Create a new user account and assign them to a tenant. Provide either
          email or phone (or both). If the user already exists, they will just
          be assigned to the tenant.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">
              Email <span className="text-zinc-400">(optional if phone provided)</span>
            </div>
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">
              Phone <span className="text-zinc-400">(optional if email provided)</span>
            </div>
            <input
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Include country code. Phone-only users can login via OTP.
            </p>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Tenant</div>
            <select
              name="tenant_id"
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="text-sm font-medium">Role</div>
            <select
              name="role"
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            >
              <option value="">Select role</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="tenant_editor">Tenant Editor</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Password (for email users)</div>
            <input
              name="password"
              type="password"
              placeholder="Leave empty to send invitation"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Required for email users unless sending invitation. Not needed for
              phone-only users.
            </p>
          </label>
          <div className="flex items-end pb-6">
            <label className="flex items-center gap-2">
              <input name="send_invite" type="checkbox" />
              <span className="text-sm">Send invitation email (email users only)</span>
            </label>
          </div>
        </div>

        <button className="rounded-md bg-black px-4 py-2 text-white">
          Create User & Assign
        </button>
      </form>

      <div className="mt-8 rounded-lg border">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
          <div>User</div>
          <div>Tenant</div>
          <div>Role</div>
          <div>Actions</div>
        </div>
        <div className="divide-y">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 text-sm"
            >
              <div>
                <div>{user.displayName}</div>
                {user.email && user.phone && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {user.phone}
                  </div>
                )}
                <div className="mt-1 font-mono text-xs text-zinc-400">
                  {user.user_id}
                </div>
              </div>
              <div>{(user as any).tenants?.name || "—"}</div>
              <div>{user.role}</div>
              <form action={deleteMembership.bind(null, user.id)}>
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
          {users.length === 0 ? (
            <div className="p-3 text-sm text-zinc-600">No users yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
