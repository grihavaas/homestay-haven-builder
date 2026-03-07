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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const auth = await getAuthHeader();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const res = await fetch(
    `${env.backendServiceUrl}/api/crawl-jobs/${jobId}/image-urls`,
    { headers: { Authorization: auth } },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
