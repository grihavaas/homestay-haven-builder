import Link from "next/link";
import { requireUser, requireMembership } from "@/lib/authz";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NewDiscoveryDialog } from "./NewDiscoveryDialog";
import { DeleteJobButton } from "./DeleteJobButton";

type CrawlJob = {
  jobId: string;
  userId?: string;
  status: "pending" | "crawling" | "crawled" | "extracting" | "running" | "completed" | "failed";
  listingUrls: string[];
  propertyName?: string;
  importSummary?: string;
  llmUsage?: {
    extraction?: { model?: string; total_tokens?: number };
    import_summary?: { total_tokens?: number };
    review_summary?: { total_tokens?: number };
    totals?: { total_tokens?: number; total_duration_ms?: number };
  };
  crawlLlmUsage?: {
    vision_gallery?: { total_tokens?: number };
    image_filter?: { total_tokens?: number };
    totals?: { total_tokens?: number };
  };
  error?: string;
  createdAt: string;
  startedAt?: string;
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
    crawling: "bg-blue-100 text-blue-800",
    crawled: "bg-cyan-100 text-cyan-800",
    extracting: "bg-indigo-100 text-indigo-800",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Discoveries</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Crawled property listings ready for review and import.
          </p>
        </div>
        <NewDiscoveryDialog />
      </div>

      {jobs.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">No discoveries yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 text-left text-zinc-700">
                <th className="py-3 pl-3 pr-2 font-medium">Name</th>
                <th className="px-2 py-3 font-medium whitespace-nowrap">Status</th>
                <th className="px-2 py-3 font-medium whitespace-nowrap">Token Cost</th>
                <th className="px-2 py-3 font-medium whitespace-nowrap">Start</th>
                <th className="px-2 py-3 font-medium whitespace-nowrap">End</th>
                <th className="py-3 pl-2 pr-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map((job) => (
                <tr key={job.jobId}>
                  <td className="py-3 pl-3 pr-2">
                    {(job.status === "completed" || job.status === "crawled") ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/admin/agency/discoveries/${job.jobId}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {job.propertyName || job.listingUrls?.[0] || job.jobId}
                            </Link>
                          </TooltipTrigger>
                          {job.importSummary && (
                            <TooltipContent side="bottom" className="max-w-sm text-xs">
                              {job.importSummary}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-zinc-700">
                        {job.propertyName || job.listingUrls?.[0] || job.jobId}
                      </span>
                    )}
                    {job.error && (
                      <p className="text-xs text-red-600 mt-0.5 truncate max-w-md">
                        {job.error}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-2 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {(() => {
                      const crawlTokens = job.crawlLlmUsage?.totals?.total_tokens || 0;
                      const extractTokens = job.llmUsage?.totals?.total_tokens || 0;
                      const totalTokens = crawlTokens + extractTokens;
                      if (totalTokens === 0) return <span className="text-zinc-400">—</span>;
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {totalTokens.toLocaleString()} tokens
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              {crawlTokens > 0 && <div>Crawl: {crawlTokens.toLocaleString()}</div>}
                              {extractTokens > 0 && <div>Extract: {extractTokens.toLocaleString()}</div>}
                              {job.llmUsage?.extraction?.model && <div>Model: {job.llmUsage.extraction.model}</div>}
                              {job.llmUsage?.totals?.total_duration_ms && (
                                <div>Duration: {((job.llmUsage.totals.total_duration_ms || 0) / 1000).toFixed(1)}s</div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })()}
                  </td>
                  <td className="px-2 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {job.startedAt
                      ? new Date(job.startedAt).toLocaleDateString()
                      : new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {job.completedAt
                      ? new Date(job.completedAt).toLocaleDateString()
                      : <span className="text-zinc-400">—</span>}
                  </td>
                  <td className="py-3 pl-2 pr-3">
                    {(job.status === "failed" || membership.role === "agency_admin") && (
                      <DeleteJobButton jobId={job.jobId} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
