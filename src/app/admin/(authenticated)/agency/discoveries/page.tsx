import Link from "next/link";
import { requireUser, requireMembership } from "@/lib/authz";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CrawlJob = {
  jobId: string;
  userId?: string;
  status: "pending" | "running" | "completed" | "failed";
  listingUrls: string[];
  importSummary?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  importedAt?: string;
  importedToTenantId?: string;
};

async function fetchJobs(isAdmin: boolean): Promise<CrawlJob[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return [];

  const endpoint = isAdmin ? "/api/crawl-jobs-all" : "/api/crawl-jobs";
  const res = await fetch(`${env.backendServiceUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.jobs ?? [];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-zinc-100 text-zinc-800"}`}
    >
      {status}
    </span>
  );
}

export default async function DiscoveriesPage() {
  const [_user, membership] = await Promise.all([
    requireUser(),
    requireMembership(),
  ]);

  if (membership.role !== "agency_admin" && membership.role !== "agency_rm") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">My Discoveries</h1>
        <p className="mt-2 text-sm text-zinc-600">Access denied.</p>
      </div>
    );
  }

  const jobs = await fetchJobs(membership.role === "agency_admin");

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Discoveries</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Crawled property listings ready for review and import.
      </p>

      {jobs.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">No discoveries yet.</p>
      ) : (
        <div className="mt-6 rounded-lg border">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-zinc-50 p-3 text-sm font-medium text-zinc-700">
            <div>Property</div>
            <div>Status</div>
            <div>Created</div>
            <div>Imported</div>
          </div>
          <div className="divide-y">
            {jobs.map((job) => (
              <div
                key={job.jobId}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-3 text-sm items-center"
              >
                <div>
                  {job.status === "completed" ? (
                    <Link
                      href={`/admin/agency/discoveries/${job.jobId}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {job.importSummary || job.listingUrls?.[0] || job.jobId}
                    </Link>
                  ) : (
                    <span className="text-zinc-700">
                      {job.importSummary || job.listingUrls?.[0] || job.jobId}
                    </span>
                  )}
                  {job.error && (
                    <p className="text-xs text-red-600 mt-0.5 truncate max-w-md">
                      {job.error}
                    </p>
                  )}
                </div>
                <StatusBadge status={job.status} />
                <div className="text-zinc-500 text-xs whitespace-nowrap">
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div>
                  {job.importedAt ? (
                    <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-medium">
                      Imported
                    </span>
                  ) : (
                    <span className="text-zinc-400 text-xs">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
