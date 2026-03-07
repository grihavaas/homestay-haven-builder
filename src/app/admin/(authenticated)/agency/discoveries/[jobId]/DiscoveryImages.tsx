"use client";

import { useState, useEffect } from "react";

interface CrawledImage {
  s3Key: string;
  sourceUrl: string;
  alt: string;
  suggestedType: "hero" | "gallery" | "room_image";
  roomName?: string;
}

interface PreviewImage {
  s3Key: string;
  previewUrl: string;
  alt: string;
  suggestedType: "hero" | "gallery" | "room_image";
  roomName?: string;
}

export function DiscoveryImages({
  jobId,
  images,
  rooms,
  onChange,
  disabled,
}: {
  jobId: string;
  images: CrawledImage[];
  rooms: Array<{ name: string }>;
  onChange: (images: CrawledImage[]) => void;
  disabled?: boolean;
}) {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPreviews() {
      try {
        const res = await fetch(`/api/discoveries/${jobId}/image-urls`);
        if (!res.ok) throw new Error("Failed to load image previews");
        const data = await res.json();
        setPreviews(data.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setLoading(false);
      }
    }
    loadPreviews();
  }, [jobId]);

  function getPreviewUrl(s3Key: string): string | undefined {
    return previews.find((p) => p.s3Key === s3Key)?.previewUrl;
  }

  function updateImage(index: number, updates: Partial<CrawledImage>) {
    const updated = images.map((img, i) => (i === index ? { ...img, ...updates } : img));
    onChange(updated);
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-zinc-500">Loading images...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-sm text-red-500">{error}</div>;
  }

  if (images.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        No images were found during the crawl.
      </div>
    );
  }

  const typeBadgeColors: Record<string, string> = {
    hero: "bg-amber-100 text-amber-800",
    gallery: "bg-blue-100 text-blue-800",
    room_image: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">
        {images.length} image{images.length !== 1 ? "s" : ""} found during crawl. Review and adjust types/room assignments before importing.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, idx) => {
          const url = getPreviewUrl(img.s3Key);
          return (
            <div key={img.s3Key} className="rounded-lg border bg-white p-2 space-y-2">
              <div className="aspect-[4/3] overflow-hidden rounded bg-zinc-100">
                {url ? (
                  <img
                    src={url}
                    alt={img.alt || `Image ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    No preview
                  </div>
                )}
              </div>

              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColors[img.suggestedType] || "bg-zinc-100"}`}>
                {img.suggestedType.replace("_", " ")}
              </span>

              <div className="space-y-1">
                <select
                  value={img.suggestedType}
                  onChange={(e) => updateImage(idx, { suggestedType: e.target.value as CrawledImage["suggestedType"] })}
                  disabled={disabled}
                  className="w-full rounded border px-2 py-1 text-xs"
                >
                  <option value="hero">Hero</option>
                  <option value="gallery">Gallery</option>
                  <option value="room_image">Room Image</option>
                </select>

                {img.suggestedType === "room_image" && (
                  <select
                    value={img.roomName || ""}
                    onChange={(e) => updateImage(idx, { roomName: e.target.value || undefined })}
                    disabled={disabled}
                    className="w-full rounded border px-2 py-1 text-xs"
                  >
                    <option value="">Select room...</option>
                    {rooms.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {img.alt && (
                <p className="truncate text-xs text-zinc-500" title={img.alt}>
                  {img.alt}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
