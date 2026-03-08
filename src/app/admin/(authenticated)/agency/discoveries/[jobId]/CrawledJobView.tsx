"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reExtractJob } from "../actions";

export function CrawledJobView({
  jobId,
  propertyName,
  crawlLlmUsage,
}: {
  jobId: string;
  propertyName?: string;
  crawlLlmUsage?: {
    vision_gallery?: { total_tokens?: number };
    image_filter?: { total_tokens?: number };
    totals?: { total_tokens?: number };
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRunExtraction() {
    setLoading(true);
    setError(null);
    const result = await reExtractJob(jobId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to start extraction");
      setLoading(false);
    }
  }

  const totalTokens = crawlLlmUsage?.totals?.total_tokens || 0;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold mb-2">
        {propertyName || "Crawled Discovery"}
      </h1>

      <div className="rounded-lg border bg-white p-6 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center rounded-full bg-cyan-100 text-cyan-800 px-2.5 py-0.5 text-xs font-medium">
            crawled
          </span>
          {totalTokens > 0 && (
            <span className="text-xs text-zinc-500">
              Crawl cost: {totalTokens.toLocaleString()} tokens
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-600 mb-6">
          Pages have been crawled and images downloaded. Click below to run AI extraction
          on the crawled content.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          onClick={handleRunExtraction}
          disabled={loading}
          className="rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Starting..." : "Run Extraction"}
        </button>
      </div>
    </div>
  );
}
