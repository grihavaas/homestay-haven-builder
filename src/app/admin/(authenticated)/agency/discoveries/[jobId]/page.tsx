import Link from "next/link";
import { requireUser, requireMembership, getMemberships } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { DiscoveryEditor } from "./DiscoveryEditor";

async function fetchJob(jobId: string, token: string) {
  const res = await fetch(
    `${env.backendServiceUrl}/api/crawl-jobs/${jobId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json();
}

async function fetchTenants(role: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  if (role === "agency_admin") {
    const { data } = await supabase
      .from("tenants")
      .select("id,name")
      .order("name");
    return data ?? [];
  }

  // agency_rm — tenants from their memberships
  const { data } = await supabase
    .from("tenant_memberships")
    .select("tenant_id,tenants(id,name)")
    .eq("user_id", userId)
    .neq("role", "agency_rm");

  if (!data) return [];
  return data
    .map((m) => {
      const t = m.tenants as unknown as { id: string; name: string } | null;
      return t ? { id: t.id, name: t.name } : null;
    })
    .filter((t): t is { id: string; name: string } => t !== null);
}

export default async function DiscoveryEditorPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const user = await requireUser();
  const membership = await requireMembership();

  if (membership.role !== "agency_admin" && membership.role !== "agency_rm") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-sm text-zinc-600">
          You do not have permission to view discoveries.
        </p>
      </div>
    );
  }

  const { jobId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="text-sm text-zinc-600">Session expired. Please log in again.</p>
      </div>
    );
  }

  const job = await fetchJob(jobId, session.access_token);
  if (!job || !job.success) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Not Found</h1>
        <p className="mt-2 text-sm text-zinc-600">Discovery not found.</p>
        <Link href="/admin/agency/discoveries" className="mt-4 inline-block underline">
          Back to discoveries
        </Link>
      </div>
    );
  }

  // Fetch the extracted JSON from S3
  let initialData = null;
  if (job.extractedJsonUrl) {
    try {
      const jsonRes = await fetch(job.extractedJsonUrl);
      if (jsonRes.ok) {
        initialData = await jsonRes.json();
      }
    } catch {
      // JSON fetch failed
    }
  }

  if (!initialData) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">No Data</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {job.status === "completed"
            ? "Could not load extracted data."
            : `Job is ${job.status}. Check back when it completes.`}
        </p>
        <Link href="/admin/agency/discoveries" className="mt-4 inline-block underline">
          Back to discoveries
        </Link>
      </div>
    );
  }

  const tenants = await fetchTenants(membership.role, user.id);

  return (
    <div>
      <nav className="text-sm text-zinc-500 mb-4">
        <Link href="/admin/agency/discoveries" className="hover:text-zinc-700">
          Discoveries
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{initialData.property?.name || jobId}</span>
      </nav>

      <DiscoveryEditor
        initialData={initialData}
        jobId={jobId}
        tenants={tenants}
        jobMeta={{
          importedAt: job.importedAt,
          importedToTenantId: job.importedToTenantId,
        }}
      />
    </div>
  );
}
