"use client";

import { useRouter } from "next/navigation";
import { AddPhotosButton } from "./AddPhotosButton";
import { MediaThumbnailTap } from "./MediaThumbnailTap";
import type { MoveDestination } from "./MediaThumbnailTap";
import type { MediaItem } from "./MainPhotosSection";

export function GallerySection({
  propertyId,
  tenantId,
  items,
  rooms,
  hosts,
  createMediaRecord,
  deleteMedia,
  assignMedia,
  updateMediaOrder,
}: {
  propertyId: string;
  tenantId: string;
  items: MediaItem[];
  rooms: Array<{ id: string; name: string }>;
  hosts: Array<{ id: string; name: string }>;
  createMediaRecord: (formData: FormData) => Promise<void>;
  deleteMedia: (mediaId: string) => Promise<void>;
  assignMedia: (mediaId: string, mediaType: string, roomId: string | null, hostId: string | null) => Promise<void>;
  updateMediaOrder: (mediaId: string, newOrder: number) => Promise<void>;
}) {
  const router = useRouter();
  const sorted = [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const destinations: MoveDestination[] = [
    { label: "Main photos", mediaType: "hero" },
    ...rooms.map((r) => ({ label: `${r.name} photos`, mediaType: "room_image" as const, roomId: r.id })),
    ...hosts.map((h) => ({ label: `${h.name} photo`, mediaType: "host_image" as const, hostId: h.id })),
    { label: "Gallery", mediaType: "gallery" },
  ];

  async function handleMoveTo(mediaId: string, dest: MoveDestination) {
    await assignMedia(mediaId, dest.mediaType, dest.roomId ?? null, dest.hostId ?? null);
  }

  async function handleMoveUp(index: number) {
    if (index <= 0) return;
    const a = sorted[index];
    const b = sorted[index - 1];
    await updateMediaOrder(a.id, b.display_order ?? index - 1);
    await updateMediaOrder(b.id, a.display_order ?? index);
    router.refresh();
  }

  async function handleMoveDown(index: number) {
    if (index >= sorted.length - 1) return;
    const a = sorted[index];
    const b = sorted[index + 1];
    await updateMediaOrder(a.id, b.display_order ?? index + 1);
    await updateMediaOrder(b.id, a.display_order ?? index);
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-base font-semibold text-zinc-900">Gallery</h3>
        <AddPhotosButton
          propertyId={propertyId}
          tenantId={tenantId}
          destination={{ mediaType: "gallery" }}
          displayOrderStart={sorted.length}
          createMediaRecord={createMediaRecord}
          label="Add photos"
          multiple={true}
        />
      </div>
      <p className="text-xs text-zinc-500 mb-3">Extra photos for your property gallery.</p>
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 py-4">No gallery photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sorted.map((item, index) => (
            <MediaThumbnailTap
              key={item.id}
              id={item.id}
              src={item.s3_url}
              alt={item.alt_text ?? "Photo"}
              onMoveTo={handleMoveTo}
              onDelete={deleteMedia}
              destinations={destinations}
              showReorder={true}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              canMoveUp={index > 0}
              canMoveDown={index < sorted.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
