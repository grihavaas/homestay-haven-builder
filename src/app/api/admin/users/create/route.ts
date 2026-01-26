import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !requestingUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify requesting user is an agency admin
    const { data: membership } = await supabase
      .from("tenant_memberships")
      .select("role")
      .eq("user_id", requestingUser.id)
      .maybeSingle();

    if (!membership || membership.role !== "agency_admin") {
      return NextResponse.json(
        { error: "Forbidden: Agency admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const { email, password, tenantId, role, sendInvite } = await req.json();

    if (!email || !tenantId || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, tenantId, role" },
        { status: 400 }
      );
    }

    // Use admin client for user operations
    const adminClient = createSupabaseAdminClient();

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      if (sendInvite) {
        // Send invitation email (user sets their own password)
        const { data: inviteData, error: inviteError } =
          await adminClient.auth.admin.inviteUserByEmail(email, {
            data: { tenant_id: tenantId },
          });
        if (inviteError) throw inviteError;
        userId = inviteData.user.id;
      } else if (password) {
        // Create user with password
        const { data: userData, error: userError } =
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: { tenant_id: tenantId },
          });
        if (userError) throw userError;
        userId = userData.user.id;
      } else {
        return NextResponse.json(
          { error: "Either password or sendInvite must be provided" },
          { status: 400 }
        );
      }
    }

    // Create or update membership
    const { error: membershipError } = await supabase
      .from("tenant_memberships")
      .upsert(
        {
          tenant_id: tenantId,
          user_id: userId,
          role,
        },
        {
          onConflict: "tenant_id,user_id",
        }
      );

    if (membershipError) {
      throw membershipError;
    }

    return NextResponse.json({
      success: true,
      userId,
      message: existingUser
        ? "User already exists, membership updated"
        : sendInvite
        ? "Invitation sent"
        : "User created successfully",
    });
  } catch (error) {
    console.error("Error in create-user API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
