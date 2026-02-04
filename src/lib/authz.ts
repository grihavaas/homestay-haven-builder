import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "agency_admin" | "tenant_admin" | "tenant_editor" | "agency_rm";

export type Membership = {
  tenant_id: string;
  role: Role;
};

// Server-side functions for Next.js
export async function requireUser() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // First try to get session to check if cookies are present
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // Debug: Log session check (only in development or with debug flag)
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_AUTH) {
      console.log("Session check:", {
        hasSession: !!sessionData?.session,
        sessionError: sessionError?.message,
        hasUser: !!sessionData?.session?.user,
      });
    }
    
    // Get the user directly
    const { data, error } = await supabase.auth.getUser();
    
    // Handle missing session gracefully - redirect to login
    if (error) {
      // Log specific error for debugging (but not NEXT_REDIRECT which is expected)
      if (error.message !== "NEXT_REDIRECT" && !error.message.includes("JWT")) {
        console.log("Auth error in requireUser:", {
          message: error.message,
          name: error.name,
          status: (error as any).status,
        });
      }
      redirect("/admin/login");
    }
    
    if (!data?.user) {
      if (process.env.NODE_ENV === "development" || process.env.DEBUG_AUTH) {
        console.log("No user data returned from getUser() - redirecting to login");
      }
      redirect("/admin/login");
    }
    
    return data.user;
  } catch (err: any) {
    // NEXT_REDIRECT is not an error - it's how Next.js handles redirects
    // Re-throw it so Next.js can handle it properly
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    
    // Log actual errors (not redirects)
    console.error("Error in requireUser:", {
      message: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : undefined,
    });
    redirect("/admin/login");
  }
}

/**
 * Fetch all memberships for the current user (e.g. agency_rm can have multiple).
 */
export async function getMemberships(): Promise<Membership[]> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("tenant_id,role")
    .eq("user_id", user.id)
    .order("tenant_id");
  if (error) {
    if (error.code === "42P01" || error.code === "42501") {
      throw new Error(
        "Database configuration error. Please ensure the tenant_memberships table exists and RLS policies are set up."
      );
    }
    throw error;
  }
  return (data ?? []) as Membership[];
}

/**
 * Require one membership. For agency_rm (multiple tenants), pass tenantId to get that context.
 * Without tenantId, returns the single membership for non-RM users, or first membership for agency_rm.
 */
export async function requireMembership(tenantId?: string): Promise<Membership> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (tenantId) {
    const { data, error } = await supabase
      .from("tenant_memberships")
      .select("tenant_id,role")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching membership:", { code: error.code, message: error.message });
      if (error.code === "42P01" || error.code === "42501") {
        throw new Error("Database configuration error. Please ensure the tenant_memberships table exists and RLS policies are set up.");
      }
      throw error;
    }
    if (!data) {
      redirect("/admin/login?error=no_membership");
    }
    return data as Membership;
  }

  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("tenant_id,role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching membership:", { code: error.code, message: error.message });
    if (error.code === "42P01" || error.code === "42501") {
      throw new Error("Database configuration error. Please ensure the tenant_memberships table exists and RLS policies are set up.");
    }
    throw error;
  }

  if (!data) {
    redirect("/admin/login?error=no_membership");
  }

  return data as Membership;
}
