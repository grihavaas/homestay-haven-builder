import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "agency_admin" | "tenant_admin" | "tenant_editor";

export type Membership = {
  tenant_id: string;
  role: Role;
};

// Server-side functions for Next.js
export async function requireUser() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // First check if we have a session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.log("No session found, redirecting to login");
      redirect("/admin/login");
    }
    
    // Then get the user
    const { data, error } = await supabase.auth.getUser();
    // Handle missing session gracefully - redirect to login
    if (error || !data?.user) {
      console.log("Error getting user or no user data:", error?.message);
      redirect("/admin/login");
    }
    return data.user;
  } catch (err) {
    // Catch any auth errors (like AuthSessionMissingError) and redirect
    console.error("Error in requireUser:", err);
    redirect("/admin/login");
  }
}

export async function requireMembership(): Promise<Membership> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("tenant_id,role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // Log the full error for debugging
    console.error("Error fetching membership:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    // If it's a table/permission error, provide helpful message
    if (error.code === "42P01" || error.code === "42501") {
      throw new Error(
        "Database configuration error. Please ensure the tenant_memberships table exists and RLS policies are set up."
      );
    }
    throw error;
  }
  
  if (!data) {
    // Authenticated but not provisioned into any tenant.
    redirect("/admin/login?error=no_membership");
  }

  return data as Membership;
}
