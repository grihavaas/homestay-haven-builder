"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useProperty } from "@/contexts/PropertyContext";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MediaThumbnailTap } from "@/app/admin/properties/[propertyId]/MediaThumbnailTap";
import type { MoveDestination } from "@/app/admin/properties/[propertyId]/MediaThumbnailTap";

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type MediaItem = {
  id: string;
  s3_url: string;
  alt_text: string | null;
  media_type: string;
  room_id: string | null;
  host_id: string | null;
  display_order: number | null;
};

export function MediaManager({ isOpen, onClose }: MediaManagerProps) {
  const { property } = useProperty();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDestination, setUploadDestination] = useState<{
    mediaType: "hero" | "room_image" | "host_image" | "gallery";
    roomId?: string | null;
    hostId?: string | null;
    displayOrderStart: number;
    replaceId?: string | null;
  } | null>(null);

  if (!property) return null;

  const allMedia: MediaItem[] = property.media ?? [];
  const rooms = property.rooms ?? [];
  const hosts = property.hosts ?? [];

  const heroMedia = allMedia.filter((m) => m.media_type === "hero");
  const roomMedia = allMedia.filter((m) => m.media_type === "room_image");
  const hostMedia = allMedia.filter((m) => m.media_type === "host_image");
  const galleryMedia = allMedia.filter(
    (m) =>
      m.media_type === "gallery" ||
      m.media_type === "other" ||
      m.media_type === "exterior" ||
      m.media_type === "common_area"
  );

  const roomMediaByRoom = new Map<string, MediaItem[]>();
  roomMedia.forEach((m) => {
    const rid = m.room_id ?? "";
    if (!roomMediaByRoom.has(rid)) roomMediaByRoom.set(rid, []);
    roomMediaByRoom.get(rid)!.push(m);
  });
  const hostMediaByHost = new Map<string, MediaItem>();
  hostMedia.forEach((m) => {
    const hid = m.host_id ?? "";
    if (!hostMediaByHost.has(hid)) hostMediaByHost.set(hid, m);
  });

  const supabase = createSupabaseBrowserClient();

  const destinations: MoveDestination[] = [
    { label: "Main photos", mediaType: "hero" },
    ...rooms.map((r: { id: string; name: string }) => ({
      label: `${r.name} photos`,
      mediaType: "room_image" as const,
      roomId: r.id,
    })),
    ...hosts.map((h: { id: string; name: string }) => ({
      label: `${h.name} photo`,
      mediaType: "host_image" as const,
      hostId: h.id,
    })),
    { label: "Gallery", mediaType: "gallery" },
  ];

  const reload = () => window.location.reload();

  async function getNextDisplayOrder(
    mediaType: string,
    roomId: string | null,
    hostId: string | null
  ): Promise<number> {
    let query = supabase
      .from("media")
      .select("display_order")
      .eq("property_id", property.id)
      .eq("media_type", mediaType)
      .order("display_order", { ascending: false })
      .limit(1);
    if (mediaType === "room_image" && roomId) {
      query = query.eq("room_id", roomId);
    } else if (mediaType === "host_image" && hostId) {
      query = query.eq("host_id", hostId);
    } else {
      query = query.is("room_id", null).is("host_id", null);
    }
    const { data } = await query;
    const max = data?.[0]?.display_order;
    return max != null ? max + 1 : 0;
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    dest: {
      mediaType: "hero" | "room_image" | "host_image" | "gallery";
      roomId?: string | null;
      hostId?: string | null;
      displayOrderStart: number;
      replaceId?: string | null;
    }
  ) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (dest.replaceId) {
      await supabase.from("media").delete().eq("id", dest.replaceId);
    }
    setUploading(true);
    let order = dest.displayOrderStart;
    const fileList = dest.mediaType === "host_image" ? [Array.from(files)[0]].filter(Boolean) : Array.from(files);
    try {
      for (const file of fileList) {
        if (!file.type.startsWith("image/")) continue;
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const filePath = `tenant/${property.tenant_id}/property/${property.id}/${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(uploadData.path);
        await supabase.from("media").insert({
          property_id: property.id,
          tenant_id: property.tenant_id,
          media_type: dest.mediaType,
          room_id: dest.mediaType === "room_image" ? dest.roomId ?? null : null,
          host_id: dest.mediaType === "host_image" ? dest.hostId ?? null : null,
          s3_url: publicUrl,
          s3_key: uploadData.path,
          alt_text: file.name,
          display_order: order,
          is_active: true,
        });
        order += 1;
      }
      toast({ title: "Photos added", description: "Your photos have been added." });
      reload();
    } catch (err) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: "Could not add photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadDestination(null);
      e.target.value = "";
    }
  }

  async function handleDelete(mediaId: string) {
    const { error } = await supabase.from("media").delete().eq("id", mediaId);
    if (error) throw error;
    toast({ title: "Deleted", description: "Photo removed." });
    reload();
  }

  async function handleMoveTo(mediaId: string, dest: MoveDestination) {
    const nextOrder = await getNextDisplayOrder(
      dest.mediaType,
      dest.roomId ?? null,
      dest.hostId ?? null
    );
    const updateData: Record<string, unknown> = {
      media_type: dest.mediaType,
      display_order: nextOrder,
      room_id: dest.mediaType === "room_image" ? dest.roomId ?? null : null,
      host_id: dest.mediaType === "host_image" ? dest.hostId ?? null : null,
    };
    if (dest.mediaType !== "room_image") updateData.room_id = null;
    if (dest.mediaType !== "host_image") updateData.host_id = null;
    const { error } = await supabase.from("media").update(updateData).eq("id", mediaId);
    if (error) throw error;
    toast({ title: "Moved", description: "Photo moved." });
    reload();
  }

  async function handleUpdateOrder(mediaId: string, newOrder: number) {
    const { error } = await supabase.from("media").update({ display_order: newOrder }).eq("id", mediaId);
    if (error) throw error;
  }

  function startAddPhotos(
    destination: { mediaType: "hero" | "room_image" | "host_image" | "gallery"; roomId?: string | null; hostId?: string | null },
    displayOrderStart: number,
    replaceId?: string | null
  ) {
    setUploadDestination({
      ...destination,
      displayOrderStart,
      replaceId: replaceId ?? undefined,
    });
    setTimeout(() => fileInputRef.current?.click(), 0);
  }

  function Section({
    title,
    items,
    addLabel,
    destination,
    replaceId,
    showReorder,
  }: {
    title: string;
    items: MediaItem[];
    addLabel: string;
    destination: {
      mediaType: "hero" | "room_image" | "host_image" | "gallery";
      roomId?: string | null;
      hostId?: string | null;
    };
    replaceId?: string | null;
    showReorder: boolean;
  }) {
    const sorted = [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <Button
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => startAddPhotos(destination, sorted.length, replaceId)}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              addLabel
            )}
          </Button>
        </div>
        {sorted.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {sorted.map((item, index) => (
              <MediaThumbnailTap
                key={item.id}
                id={item.id}
                src={item.s3_url}
                alt={item.alt_text ?? "Photo"}
                onMoveTo={handleMoveTo}
                onDelete={handleDelete}
                destinations={destinations}
                showReorder={showReorder}
                onMoveUp={
                  index > 0
                    ? () => {
                        const prev = sorted[index - 1];
                        handleUpdateOrder(item.id, prev.display_order ?? index - 1)
                          .then(() => handleUpdateOrder(prev.id, item.display_order ?? index))
                          .then(reload)
                          .catch((err) => {
                            console.error(err);
                            toast({ title: "Failed to reorder", variant: "destructive" });
                          });
                      }
                    : undefined
                }
                onMoveDown={
                  index < sorted.length - 1
                    ? () => {
                        const next = sorted[index + 1];
                        handleUpdateOrder(item.id, next.display_order ?? index + 1)
                          .then(() => handleUpdateOrder(next.id, item.display_order ?? index))
                          .then(reload)
                          .catch((err) => {
                            console.error(err);
                            toast({ title: "Failed to reorder", variant: "destructive" });
                          });
                      }
                    : undefined
                }
                canMoveUp={index > 0}
                canMoveDown={index < sorted.length - 1}
                onAfterAction={reload}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background z-50 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Photos</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="px-4 pb-3 text-sm text-muted-foreground">
              Add photos by section. Tap a photo to move or delete it.
            </p>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Section
                title="Main photos"
                items={heroMedia}
                addLabel="Add photos"
                destination={{ mediaType: "hero" }}
                showReorder={true}
              />
              {rooms.length === 0 ? (
                <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-600">Add rooms in the admin to add room photos.</p>
                </section>
              ) : (
                rooms.map((room: { id: string; name: string }) => (
                  <Section
                    key={room.id}
                    title={`${room.name} photos`}
                    items={roomMediaByRoom.get(room.id) ?? []}
                    addLabel="Add photos"
                    destination={{ mediaType: "room_image", roomId: room.id }}
                    showReorder={true}
                  />
                ))
              )}
              {hosts.length === 0 ? (
                <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-600">Add hosts in the admin to add host photos.</p>
                </section>
              ) : (
                hosts.map((host: { id: string; name: string }) => {
                  const item = hostMediaByHost.get(host.id) ?? null;
                  return (
                    <Section
                      key={host.id}
                      title={`${host.name} photo`}
                      items={item ? [item] : []}
                      addLabel={item ? "Change photo" : "Add photo"}
                      destination={{ mediaType: "host_image", hostId: host.id }}
                      replaceId={item?.id ?? null}
                      showReorder={false}
                    />
                  );
                })
              )}
              <Section
                title="Gallery"
                items={galleryMedia}
                addLabel="Add photos"
                destination={{ mediaType: "gallery" }}
                showReorder={true}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (uploadDestination) {
                  handleUpload(e, uploadDestination);
                }
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
