import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SortableMediaList } from "./SortableMediaList";
import { MediaSelectionProvider } from "./MediaSelectionManager";
import { MediaSelectionToolbar } from "./MediaSelectionToolbar";
import { SelectAllButton } from "./SelectAllButton";

async function listMedia(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .select("id,s3_url,alt_text,media_type,room_id,host_id,display_order,is_active")
    .eq("property_id", propertyId)
    .order("media_type")
    .order("display_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function getRooms(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name")
    .eq("property_id", propertyId);
  if (error) throw error;
  return data ?? [];
}

async function getHosts(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hosts")
    .select("id,name")
    .eq("property_id", propertyId);
  if (error) throw error;
  return data ?? [];
}

export async function MediaList({ 
  propertyId,
  rooms: roomsProp,
  hosts: hostsProp,
}: { 
  propertyId: string;
  rooms?: Array<{ id: string; name: string }>;
  hosts?: Array<{ id: string; name: string }>;
}) {
  const media = await listMedia(propertyId);
  const rooms = roomsProp || await getRooms(propertyId);
  const hosts = hostsProp || await getHosts(propertyId);
  const roomMap = new Map(rooms.map(r => [r.id, r.name]));
  const hostMap = new Map(hosts.map(h => [h.id, h.name]));

  async function deleteMedia(mediaId: string) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("media").delete().eq("id", mediaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function removeMedia(mediaId: string) {
    "use server";
    const supabase = await createSupabaseServerClient();
    // Move to "other" category (gallery) and clear room_id and host_id
    const { error } = await supabase
      .from("media")
      .update({
        media_type: "other",
        room_id: null,
        host_id: null,
        display_order: 0,
      })
      .eq("id", mediaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function assignMedia(
    mediaId: string,
    mediaType: string,
    roomId: string | null,
    hostId: string | null
  ) {
    "use server";
    const supabase = await createSupabaseServerClient();
    
    // Calculate the next display_order (max + 1) for this category
    let maxOrder = -1;
    if (mediaType === "room_image" && roomId) {
      // For room images, get max order for this specific room
      const { data: existing } = await supabase
        .from("media")
        .select("display_order")
        .eq("property_id", propertyId)
        .eq("media_type", "room_image")
        .eq("room_id", roomId)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0 && existing[0].display_order !== null) {
        maxOrder = existing[0].display_order;
      }
    } else if (mediaType === "host_image" && hostId) {
      // For host images, get max order for this specific host
      const { data: existing } = await supabase
        .from("media")
        .select("display_order")
        .eq("property_id", propertyId)
        .eq("media_type", "host_image")
        .eq("host_id", hostId)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0 && existing[0].display_order !== null) {
        maxOrder = existing[0].display_order;
      }
    } else {
      // For other media types, get max order for this type
      const { data: existing } = await supabase
        .from("media")
        .select("display_order")
        .eq("property_id", propertyId)
        .eq("media_type", mediaType)
        .is("room_id", null)
        .is("host_id", null)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0 && existing[0].display_order !== null) {
        maxOrder = existing[0].display_order;
      }
    }
    
    const nextOrder = maxOrder + 1;
    
    const updateData: any = {
      media_type: mediaType,
      display_order: nextOrder,
    };
    if (mediaType === "room_image") {
      updateData.room_id = roomId;
      updateData.host_id = null;
    } else if (mediaType === "host_image") {
      updateData.host_id = hostId;
      updateData.room_id = null;
    } else {
      updateData.room_id = null;
      updateData.host_id = null;
    }
    const { error } = await supabase
      .from("media")
      .update(updateData)
      .eq("id", mediaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateMediaOrder(mediaId: string, newOrder: number) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("media")
      .update({ display_order: newOrder })
      .eq("id", mediaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function bulkAssignMedia(
    mediaIds: string[],
    mediaType: string,
    roomId: string | null,
    hostId: string | null
  ) {
    "use server";
    const supabase = await createSupabaseServerClient();
    
    // Calculate the next display_order (max + 1) for this category
    let maxOrder = -1;
    if (mediaType === "room_image" && roomId) {
      const { data: existing } = await supabase
        .from("media")
        .select("display_order")
        .eq("property_id", propertyId)
        .eq("media_type", "room_image")
        .eq("room_id", roomId)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0 && existing[0].display_order !== null) {
        maxOrder = existing[0].display_order;
      }
    } else if (mediaType === "host_image" && hostId) {
      const { data: existing } = await supabase
        .from("media")
        .select("display_order")
        .eq("property_id", propertyId)
        .eq("media_type", "host_image")
        .eq("host_id", hostId)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0 && existing[0].display_order !== null) {
        maxOrder = existing[0].display_order;
      }
    } else {
      const { data: existing } = await supabase
        .from("media")
        .select("display_order")
        .eq("property_id", propertyId)
        .eq("media_type", mediaType)
        .is("room_id", null)
        .is("host_id", null)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0 && existing[0].display_order !== null) {
        maxOrder = existing[0].display_order;
      }
    }
    
    // Update all selected media items
    const updates = mediaIds.map((mediaId, index) => {
      const nextOrder = maxOrder + 1 + index;
      const updateData: any = {
        media_type: mediaType,
        display_order: nextOrder,
      };
      if (mediaType === "room_image") {
        updateData.room_id = roomId;
        updateData.host_id = null;
      } else if (mediaType === "host_image") {
        updateData.host_id = hostId;
        updateData.room_id = null;
      } else {
        updateData.room_id = null;
        updateData.host_id = null;
      }
      return supabase
        .from("media")
        .update(updateData)
        .eq("id", mediaId);
    });

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      throw new Error(`Failed to assign ${errors.length} image(s)`);
    }
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function bulkDeleteMedia(mediaIds: string[]) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("media")
      .delete()
      .in("id", mediaIds);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  // Separate room images, host images, and other media
  const roomImages = media.filter(item => item.media_type === "room_image");
  const hostImages = media.filter(item => item.media_type === "host_image");
  const otherMedia = media.filter(item => item.media_type !== "room_image" && item.media_type !== "host_image");

  // Group room images by room_id
  const roomImagesByRoom = roomImages.reduce((acc, item) => {
    const roomId = item.room_id || "unknown";
    if (!acc[roomId]) {
      acc[roomId] = [];
    }
    acc[roomId].push(item);
    return acc;
  }, {} as Record<string, typeof roomImages>);

  // Group host images by host_id
  const hostImagesByHost = hostImages.reduce((acc, item) => {
    const hostId = item.host_id || "unknown";
    if (!acc[hostId]) {
      acc[hostId] = [];
    }
    acc[hostId].push(item);
    return acc;
  }, {} as Record<string, typeof hostImages>);

  // Group other media by type
  const groupedMedia = otherMedia.reduce((acc, item) => {
    const type = item.media_type || "other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, typeof otherMedia>);

  const typeLabels: Record<string, string> = {
    hero: "Hero Images",
    host_image: "Host Images",
    exterior: "Exterior",
    common_area: "Common Areas",
    gallery: "Gallery",
    other: "All Images",
  };

  const allMediaIds = media.map(m => m.id);
  // Get only gallery/other media IDs for Select All
  const galleryMedia = media.filter(m => m.media_type === "other");
  const galleryMediaIds = galleryMedia.map(m => m.id);

  return (
    <MediaSelectionProvider>
      <div>
        <h3 className="font-medium mb-4">Uploaded Media</h3>
        <MediaSelectionToolbar
          onBulkAssign={bulkAssignMedia}
          onBulkDelete={bulkDeleteMedia}
          rooms={rooms}
          hosts={hosts}
          allMediaIds={allMediaIds}
        />
        {media.length === 0 ? (
          <p className="text-sm text-zinc-600">No media uploaded yet.</p>
        ) : (
          <div className="space-y-6">
          {/* Room Images - grouped by room */}
          {Object.keys(roomImagesByRoom).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-4 text-zinc-700">
                Room Images
              </h4>
              <div className="space-y-6">
                {Object.entries(roomImagesByRoom).map(([roomId, items]) => {
                  const roomName = roomMap.get(roomId) || "Unknown Room";
                  return (
                    <div key={roomId} className="border rounded-lg p-4 bg-zinc-900">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-white">
                          {roomName} ({items.length})
                        </h5>
                        <p className="text-xs text-zinc-400">Drag to reorder</p>
                      </div>
                      <SortableMediaList
                        items={items}
                        rooms={rooms}
                        hosts={hosts}
                        onDelete={deleteMedia}
                        onRemove={removeMedia}
                        onAssign={assignMedia}
                        onUpdateOrder={updateMediaOrder}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Host Images - grouped by host */}
          {Object.keys(hostImagesByHost).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-4 text-zinc-700">
                Host Images
              </h4>
              <div className="space-y-6">
                {Object.entries(hostImagesByHost).map(([hostId, items]) => {
                  const hostName = hostMap.get(hostId) || "Unknown Host";
                  return (
                    <div key={hostId} className="border rounded-lg p-4 bg-zinc-900">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-white">
                          {hostName} ({items.length})
                        </h5>
                        <p className="text-xs text-zinc-400">Drag to reorder</p>
                      </div>
                      <SortableMediaList
                        items={items}
                        rooms={rooms}
                        hosts={hosts}
                        onDelete={deleteMedia}
                        onRemove={removeMedia}
                        onAssign={assignMedia}
                        onUpdateOrder={updateMediaOrder}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other media types */}
          {Object.entries(groupedMedia).map(([type, items]) => {
            const needsDarkBox = type === "other" || type === "gallery";
            const isAllImages = type === "other";
            const itemIds = items.map(item => item.id);
            return (
              <div key={type}>
                {needsDarkBox ? (
                  <div className="border rounded-lg p-4 bg-zinc-900">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white">
                        {typeLabels[type] || type} ({items.length})
                      </h4>
                      <div className="flex items-center gap-3">
                        {isAllImages && (
                          <SelectAllButton galleryMediaIds={itemIds} />
                        )}
                        <p className="text-xs text-zinc-400">Drag to reorder</p>
                      </div>
                    </div>
                    <SortableMediaList
                      items={items}
                      rooms={rooms}
                      hosts={hosts}
                      onDelete={deleteMedia}
                      onRemove={removeMedia}
                      onAssign={assignMedia}
                      onUpdateOrder={updateMediaOrder}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-zinc-700">
                        {typeLabels[type] || type} ({items.length})
                      </h4>
                      <p className="text-xs text-zinc-500">Drag to reorder</p>
                    </div>
                    <SortableMediaList
                      items={items}
                      rooms={rooms}
                      hosts={hosts}
                      onDelete={deleteMedia}
                      onRemove={removeMedia}
                      onAssign={assignMedia}
                      onUpdateOrder={updateMediaOrder}
                    />
                  </>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>
    </MediaSelectionProvider>
  );
}
