import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireMembership, requireUser } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/AdminHeader";
import { CreateUserForm } from "./CreateUserForm";
import { UserList } from "./UserList";

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
  const [user, membership] = await Promise.all([requireUser(), requireMembership()]);

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

      <CreateUserForm tenants={tenants} createUserAction={createUserAndMembership} />

      <UserList
        users={users}
        currentUserId={user.id}
        deleteAction={deleteMembership}
      />
    </div>
  );
}
