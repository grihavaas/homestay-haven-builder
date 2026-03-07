"use client";

import { useEffect, useState } from "react";

interface VisionDebugEntry {
  label: string;
  timestamp: string;
  screenshotUrl: string;
  metadata: {
    pageUrl?: string;
    visionResponse?: { found: boolean; x?: number; y?: number; description?: string };
    rawResponse?: string;
    clickedAt?: { x: number; y: number };
    description?: string;
  };
}

export function DiscoveryVisionDebug({ jobId }: { jobId: string }) {
  const [entries, setEntries] = useState<VisionDebugEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/discoveries/${jobId}/vision-debug`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEntries(data.entries || []);
        } else {
          setError(data.error || "Failed to load vision debug data");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return <p className="text-sm text-zinc-500 py-8 text-center">Loading vision debug data...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 py-8 text-center">{error}</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        No vision debug data available for this crawl job.
        <br />
        Vision debug artifacts are only generated when the crawler uses GPT-4o vision to discover gallery triggers.
      </div>
    );
  }

  // Group pre-click and post-click by timestamp proximity
  const preClicks = entries.filter((e) => e.label === "pre-click");
  const postClicks = entries.filter((e) => e.label === "post-click");

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600">
        Screenshots and GPT-4o vision responses from gallery discovery. The crawler screenshots the page, asks
        GPT-4o to identify gallery/photo triggers, then clicks the returned coordinates.
      </p>

      {preClicks.map((preClick, i) => {
        const postClick = postClicks[i];
        const vision = preClick.metadata.visionResponse;
        const clickCoords = postClick?.metadata.clickedAt;

        return (
          <div key={preClick.timestamp} className="border rounded-lg overflow-hidden">
            <div className="bg-zinc-50 px-4 py-2 border-b">
              <h3 className="text-sm font-medium">
                Vision Attempt #{i + 1}
                {preClick.metadata.pageUrl && (
                  <span className="ml-2 text-zinc-400 font-normal text-xs truncate">
                    {preClick.metadata.pageUrl}
                  </span>
                )}
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Vision response summary */}
              <div className="rounded bg-zinc-50 p-3 text-sm space-y-1">
                <div>
                  <span className="font-medium">Gallery found:</span>{" "}
                  <span className={vision?.found ? "text-green-700" : "text-red-600"}>
                    {vision?.found ? "Yes" : "No"}
                  </span>
                </div>
                {vision?.found && vision.x != null && vision.y != null && (
                  <div>
                    <span className="font-medium">Click target:</span>{" "}
                    ({vision.x}, {vision.y})
                  </div>
                )}
                {(vision?.description || postClick?.metadata.description) && (
                  <div>
                    <span className="font-medium">Description:</span>{" "}
                    {vision?.description || postClick?.metadata.description}
                  </div>
                )}
              </div>

              {/* Screenshots side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pre-click */}
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-1">Pre-click screenshot</p>
                  <div className="relative border rounded overflow-hidden bg-zinc-100">
                    {preClick.screenshotUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preClick.screenshotUrl}
                          alt="Pre-click screenshot"
                          className="w-full h-auto"
                        />
                        {/* Render click target dot */}
                        {vision?.found && vision.x != null && vision.y != null && (
                          <div
                            className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
                            style={{
                              left: `${(vision.x / 1920) * 100}%`,
                              top: `${(vision.y / 1080) * 100}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                            title={`Click target: (${vision.x}, ${vision.y})`}
                          />
                        )}
                      </>
                    ) : (
                      <p className="p-4 text-xs text-zinc-400">Screenshot not available</p>
                    )}
                  </div>
                </div>

                {/* Post-click */}
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-1">Post-click screenshot</p>
                  <div className="border rounded overflow-hidden bg-zinc-100">
                    {postClick?.screenshotUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={postClick.screenshotUrl}
                          alt="Post-click screenshot"
                          className="w-full h-auto"
                        />
                      </>
                    ) : (
                      <p className="p-4 text-xs text-zinc-400">
                        {vision?.found ? "Screenshot not available" : "No click was attempted"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Raw JSON toggle */}
              <details className="text-xs">
                <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700">
                  Raw vision response
                </summary>
                <pre className="mt-2 bg-zinc-50 rounded p-3 overflow-x-auto text-[11px] leading-relaxed">
                  {preClick.metadata.rawResponse || JSON.stringify(preClick.metadata, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        );
      })}
    </div>
  );
}
