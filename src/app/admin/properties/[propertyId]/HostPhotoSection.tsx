"use client";

import { AddPhotosButton } from "./AddPhotosButton";
import { MediaThumbnailTap } from "./MediaThumbnailTap";
import type { MoveDestination } from "./MediaThumbnailTap";
import type { MediaItem } from "./MainPhotosSection";

export function HostPhotoSection({
  propertyId,
  tenantId,
  host,
  item,
  rooms,
  hosts,
  createMediaRecord,
  deleteMedia,
  assignMedia,
}: {
  propertyId: string;
  tenantId: string;
  host: { id: string; name: string };
  item: MediaItem | null;
  rooms: Array<{ id: string; name: string }>;
  hosts: Array<{ id: string; name: string }>;
  createMediaRecord: (formData: FormData) => Promise<void>;
  deleteMedia: (mediaId: string) => Promise<void>;
  assignMedia: (mediaId: string, mediaType: string, roomId: string | null, hostId: string | null) => Promise<void>;
}) {
  const destinations: MoveDestination[] = [
    { label: "Main photos", mediaType: "hero" },
    ...rooms.map((r) => ({ label: `${r.name} photos`, mediaType: "room_image" as const, roomId: r.id })),
    ...hosts.map((h) => ({ label: `${h.name} photo`, mediaType: "host_image" as const, hostId: h.id })),
    { label: "Gallery", mediaType: "gallery" },
  ];

  async function handleMoveTo(mediaId: string, dest: MoveDestination) {
    await assignMedia(mediaId, dest.mediaType, dest.roomId ?? null, dest.hostId ?? null);
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-base font-semibold text-zinc-900">{host.name} photo</h3>
        <AddPhotosButton
          propertyId={propertyId}
          tenantId={tenantId}
          destination={{ mediaType: "host_image", hostId: host.id }}
          displayOrderStart={0}
          createMediaRecord={createMediaRecord}
          deleteMedia={deleteMedia}
          onReplaceBeforeAdd={item?.id ?? null}
          label={item ? "Change photo" : "Add photo"}
          multiple={false}
        />
      </div>
      <p className="text-xs text-zinc-500 mb-3">One photo per host.</p>
      {item ? (
        <div className="max-w-[200px]">
          <MediaThumbnailTap
            id={item.id}
            src={item.s3_url}
            alt={item.alt_text ?? "Host photo"}
            onMoveTo={handleMoveTo}
            onDelete={deleteMedia}
            destinations={destinations.filter((d) => !(d.mediaType === "host_image" && d.hostId === host.id))}
          />
        </div>
      ) : (
        <p className="text-sm text-zinc-500 py-4">No photo yet.</p>
      )}
    </section>
  );
}
