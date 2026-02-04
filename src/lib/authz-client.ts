// Client-side functions (for use in client components)
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

export type Role = "agency_admin" | "tenant_admin" | "tenant_editor" | "agency_rm";

export type Membership = {
  tenant_id: string;
  role: Role;
};

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return null;
    }
    return data.user;
  } catch (err) {
    // Ignore abort errors - they're usually from navigation or React Strict Mode
    if (err instanceof Error && err.name === 'AbortError') {
      return null;
    }
    console.error("Error getting user:", err);
    return null;
  }
}

export async function getMembership(userId: string): Promise<Membership | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("tenant_memberships")
      .select("tenant_id,role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      if (error.message?.includes('aborted') || error.message?.includes('AbortError')) {
        return null;
      }
      console.error("Error fetching membership:", { code: error.code, message: error.message });
      if (error.code === "42P01" || error.code === "42501") {
        throw new Error(
          "Database configuration error. Please ensure the tenant_memberships table exists and RLS policies are set up."
        );
      }
      throw error;
    }

    return data as Membership | null;
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
      return null;
    }
    console.error("Error getting membership:", err);
    return null;
  }
}

/** Fetch all memberships for a user (agency_rm can have multiple). */
export async function getMemberships(userId: string): Promise<Membership[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("tenant_memberships")
      .select("tenant_id,role")
      .eq("user_id", userId)
      .order("tenant_id");

    if (error) {
      if (error.message?.includes('aborted') || error.message?.includes('AbortError')) {
        return [];
      }
      console.error("Error fetching memberships:", { code: error.code, message: error.message });
      if (error.code === "42P01" || error.code === "42501") {
        throw new Error(
          "Database configuration error. Please ensure the tenant_memberships table exists and RLS policies are set up."
        );
      }
      throw error;
    }
    return (data ?? []) as Membership[];
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
      return [];
    }
    console.error("Error getting memberships:", err);
    return [];
  }
}
