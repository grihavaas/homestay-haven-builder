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
    `${env.backendServiceUrl}/api/crawl-jobs/${jobId}`,
    { headers: { Authorization: auth } },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const auth = await getAuthHeader();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const body = await req.json();
  const res = await fetch(
    `${env.backendServiceUrl}/api/crawl-jobs/${jobId}/extracted`,
    {
      method: "PUT",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const auth = await getAuthHeader();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const body = await req.json();
  const res = await fetch(
    `${env.backendServiceUrl}/api/crawl-jobs/${jobId}/claim-import`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  // Fetch the extracted JSON server-side (S3 presigned URLs don't have CORS)
  if (data.extractedJsonUrl) {
    try {
      const jsonRes = await fetch(data.extractedJsonUrl);
      if (jsonRes.ok) {
        data.extractedJson = await jsonRes.json();
      }
    } catch {
      // Fall through — client will see extractedJsonUrl but no extractedJson
    }
  }

  return NextResponse.json(data, { status: res.status });
}
