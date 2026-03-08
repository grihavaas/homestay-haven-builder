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

  // Get the job to obtain the presigned URL
  const jobRes = await fetch(
    `${env.backendServiceUrl}/api/crawl-jobs/${jobId}`,
    { headers: { Authorization: auth } },
  );
  if (!jobRes.ok) {
    return NextResponse.json({ error: "Job not found" }, { status: jobRes.status });
  }

  const jobData = await jobRes.json();
  if (!jobData.extractedJsonUrl) {
    return NextResponse.json({ error: "No extracted JSON available" }, { status: 404 });
  }

  // Fetch the S3 presigned URL server-side (avoids CORS)
  const jsonRes = await fetch(jobData.extractedJsonUrl);
  if (!jsonRes.ok) {
    return NextResponse.json({ error: "Failed to fetch extracted JSON" }, { status: 502 });
  }

  const data = await jsonRes.json();
  return NextResponse.json(data);
}
