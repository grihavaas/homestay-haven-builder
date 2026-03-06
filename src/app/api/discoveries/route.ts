import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

async function getAuthHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  return `Bearer ${session.access_token}`;
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const auth = await getAuthHeader();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine endpoint based on query param, with role check
  const allJobs = req.nextUrl.searchParams.get("all") === "true";

  if (allJobs) {
    // Only agency_admin can list all jobs
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: membership } = await supabase
      .from("tenant_memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "agency_admin")
      .limit(1);
    if (!membership || membership.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const endpoint = allJobs ? "/api/crawl-jobs-all" : "/api/crawl-jobs";
  const res = await fetch(`${env.backendServiceUrl}${endpoint}`, {
    headers: { Authorization: auth },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
