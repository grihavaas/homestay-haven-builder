import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireMembership } from "@/lib/authz";
import { MainPhotosSection } from "./MainPhotosSection";
import { RoomPhotosSection } from "./RoomPhotosSection";
import { HostPhotoSection } from "./HostPhotoSection";
import { GallerySection } from "./GallerySection";

async function listMedia(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .select("id,s3_url,alt_text,media_type,room_id,host_id,display_order,is_active")
    .eq("property_id", propertyId)
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
    .eq("property_id", propertyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

async function getHosts(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hosts")
    .select("id,name")
    .eq("property_id", propertyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function MediaTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  await requireMembership(tenantId);

  const [media, rooms, hosts] = await Promise.all([
    listMedia(propertyId),
    getRooms(propertyId),
    getHosts(propertyId),
  ]);

  async function createMediaRecord(formData: FormData) {
    "use server";
    const property_id = String(formData.get("property_id") ?? "");
    const tenant_id = String(formData.get("tenant_id") ?? "");
    await requireMembership(tenant_id || undefined);

    const media_type = String(formData.get("media_type") ?? "");
    const room_id = String(formData.get("room_id") ?? "").trim() || null;
    const host_id = String(formData.get("host_id") ?? "").trim() || null;
    const s3_url = String(formData.get("s3_url") ?? "");
    const s3_key = String(formData.get("s3_key") ?? "");
    const alt_text = String(formData.get("alt_text") ?? "");
    const display_order = Number(formData.get("display_order")) || 0;
    const is_active = formData.get("is_active") === "true";

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Authentication required");

    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("tenant_id")
      .eq("id", property_id)
      .single();
    if (propError || !property || property.tenant_id !== tenant_id) {
      throw new Error("Property not found");
    }
    if (media_type === "room_image" && !room_id) throw new Error("Room ID required for room images");
    if (media_type === "host_image" && !host_id) throw new Error("Host ID required for host images");

    const { error } = await supabase.from("media").insert({
      property_id,
      tenant_id,
      media_type,
      room_id: room_id || null,
      host_id: host_id || null,
      s3_url,
      s3_key,
      alt_text,
      display_order,
      is_active,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteMedia(mediaId: string) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("media").delete().eq("id", mediaId);
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
      if (existing?.length && existing[0].display_order != null) maxOrder = existing[0].display_order;
    } else if (mediaType === "host_image" && hostId) {
      const { data: existing } = await supabase
        .from("media")
        .select("display_order")
        .eq("property_id", propertyId)
        .eq("media_type", "host_image")
        .eq("host_id", hostId)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing?.length && existing[0].display_order != null) maxOrder = existing[0].display_order;
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
      if (existing?.length && existing[0].display_order != null) maxOrder = existing[0].display_order;
    }
    const nextOrder = maxOrder + 1;
    const updateData: Record<string, unknown> = {
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
    const { error } = await supabase.from("media").update(updateData).eq("id", mediaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateMediaOrder(mediaId: string, newOrder: number) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("media").update({ display_order: newOrder }).eq("id", mediaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  const heroMedia = media.filter((m) => m.media_type === "hero");
  const roomMedia = media.filter((m) => m.media_type === "room_image");
  const hostMedia = media.filter((m) => m.media_type === "host_image");
  const galleryMedia = media.filter((m) => m.media_type === "gallery" || m.media_type === "other" || m.media_type === "exterior" || m.media_type === "common_area");

  const roomMediaByRoom = new Map<string, typeof roomMedia>();
  for (const m of roomMedia) {
    const rid = m.room_id ?? "";
    if (!roomMediaByRoom.has(rid)) roomMediaByRoom.set(rid, []);
    roomMediaByRoom.get(rid)!.push(m);
  }
  const hostMediaByHost = new Map<string, (typeof hostMedia)[0]>();
  for (const m of hostMedia) {
    const hid = m.host_id ?? "";
    if (!hostMediaByHost.has(hid)) hostMediaByHost.set(hid, m); // one photo per host
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Photos</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Add and manage photos by section. Tap a photo to move or delete it.
      </p>

      <div className="mt-6 space-y-6">
        <MainPhotosSection
          propertyId={propertyId}
          tenantId={tenantId}
          items={heroMedia}
          rooms={rooms}
          hosts={hosts}
          createMediaRecord={createMediaRecord}
          deleteMedia={deleteMedia}
          assignMedia={assignMedia}
          updateMediaOrder={updateMediaOrder}
        />

        {rooms.length === 0 ? (
          <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-base font-semibold text-zinc-700">Photos by room</h3>
            <p className="mt-2 text-sm text-zinc-500">Add rooms in the Rooms tab first, then add photos here.</p>
          </section>
        ) : (
          rooms.map((room) => (
            <RoomPhotosSection
              key={room.id}
              propertyId={propertyId}
              tenantId={tenantId}
              room={room}
              items={roomMediaByRoom.get(room.id) ?? []}
              rooms={rooms}
              hosts={hosts}
              createMediaRecord={createMediaRecord}
              deleteMedia={deleteMedia}
              assignMedia={assignMedia}
              updateMediaOrder={updateMediaOrder}
            />
          ))
        )}

        {hosts.length === 0 ? (
          <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-base font-semibold text-zinc-700">Host photo</h3>
            <p className="mt-2 text-sm text-zinc-500">Add hosts in the Hosts tab first, then add a photo here.</p>
          </section>
        ) : (
          hosts.map((host) => (
            <HostPhotoSection
              key={host.id}
              propertyId={propertyId}
              tenantId={tenantId}
              host={host}
              item={hostMediaByHost.get(host.id) ?? null}
              rooms={rooms}
              hosts={hosts}
              createMediaRecord={createMediaRecord}
              deleteMedia={deleteMedia}
              assignMedia={assignMedia}
            />
          ))
        )}

        <GallerySection
          propertyId={propertyId}
          tenantId={tenantId}
          items={galleryMedia}
          rooms={rooms}
          hosts={hosts}
          createMediaRecord={createMediaRecord}
          deleteMedia={deleteMedia}
          assignMedia={assignMedia}
          updateMediaOrder={updateMediaOrder}
        />
      </div>
    </div>
  );
}
