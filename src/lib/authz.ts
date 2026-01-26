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
