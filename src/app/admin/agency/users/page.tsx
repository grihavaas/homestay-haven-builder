import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireMembership, requireUser } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/AdminHeader";
import { CreateUserForm } from "./CreateUserForm";
import { UserList } from "./UserList";

async function listAllUsers() {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  // Get all memberships
  const { data: memberships, error } = await supabase
    .from("tenant_memberships")
    .select("id,user_id,tenant_id,role,created_at,tenants(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Get all Supabase users
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  const allUsers = usersData?.users ?? [];

  // Create a map of user_id to membership
  const membershipMap: Record<string, typeof memberships[0]> = {};
  (memberships ?? []).forEach((m) => {
    membershipMap[m.user_id] = m;
  });

  // Build unified user list
  return allUsers.map((user) => {
    const membership = membershipMap[user.id];
    const firstName = user.user_metadata?.first_name || "";
    const lastName = user.user_metadata?.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return {
      id: user.id,
      user_id: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      first_name: firstName,
      last_name: lastName,
      displayName: fullName || user.email || user.phone || user.id.substring(0, 8) + "...",
      created_at: user.created_at,
      // Membership info (may be null if unassigned)
      membership_id: membership?.id || null,
      tenant_id: membership?.tenant_id || null,
      tenant_name: Array.isArray(membership?.tenants)
        ? membership.tenants[0]?.name
        : (membership?.tenants as any)?.name || null,
      role: membership?.role || null,
    };
  });
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

  const [users, tenants] = await Promise.all([listAllUsers(), listTenants()]);

  async function createUserAndMembership(formData: FormData) {
    "use server";
    const firstName = String(formData.get("first_name") ?? "").trim();
    const lastName = String(formData.get("last_name") ?? "").trim();
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

    const userMetadata = {
      tenant_id: tenantId,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
    };

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update metadata if name provided
      if (firstName || lastName) {
        await adminClient.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...existingUser.user_metadata,
            first_name: firstName || existingUser.user_metadata?.first_name,
            last_name: lastName || existingUser.user_metadata?.last_name,
          },
        });
      }
    } else {
      // Create new user
      if (phone && !email) {
        // Phone-only user creation
        const { data: userData, error: userError } =
          await adminClient.auth.admin.createUser({
            phone,
            phone_confirm: true,
            user_metadata: userMetadata,
          });
        if (userError) throw userError;
        userId = userData.user.id;
      } else if (sendInvite && email) {
        // Send invitation email (user sets their own password)
        const { data: inviteData, error: inviteError } =
          await adminClient.auth.admin.inviteUserByEmail(email, {
            data: userMetadata,
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
          user_metadata: typeof userMetadata;
        } = {
          email,
          password,
          email_confirm: true,
          user_metadata: userMetadata,
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

  async function assignTenant(formData: FormData) {
    "use server";
    const userId = String(formData.get("user_id") ?? "").trim();
    const tenantId = String(formData.get("tenant_id") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();

    if (!userId || !tenantId || !role) return;

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("tenant_memberships").insert({
      tenant_id: tenantId,
      user_id: userId,
      role,
    });

    if (error) {
      if (error.code === "23505") {
        // Already exists, update
        const { error: updateError } = await supabase
          .from("tenant_memberships")
          .update({ role, tenant_id: tenantId })
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
        tenants={tenants}
        currentUserId={user.id}
        deleteAction={deleteMembership}
        assignAction={assignTenant}
      />
    </div>
  );
}
