import Link from "next/link";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RoomsManager } from "./RoomsManager";

async function listRooms(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name,description,max_guests,adults_capacity,children_capacity,extra_beds_available,extra_beds_count,room_size_sqft,view_type,is_active")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}


async function getBedConfigurations(roomId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bed_configurations")
    .select("id,bed_type,bed_count,is_sofa_bed,is_extra_bed")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function getRoomAmenities(roomId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("room_amenities")
    .select("amenity_id")
    .eq("room_id", roomId);
  if (error) throw error;
  return new Set((data ?? []).map((a) => a.amenity_id));
}

async function getRoomScopeAmenities() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("standard_amenities")
    .select("id,name,category")
    .in("amenity_scope", ["room", "both"])
    .order("category")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function RoomsTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const rooms = await listRooms(propertyId);
  
  // Fetch bed configurations for all rooms
  const bedsMap: Record<string, Awaited<ReturnType<typeof getBedConfigurations>>> = {};
  const roomAmenitiesMap: Record<string, Set<string>> = {};
  for (const room of rooms) {
    bedsMap[room.id] = await getBedConfigurations(room.id);
    roomAmenitiesMap[room.id] = await getRoomAmenities(room.id);
  }
  
  // Fetch room-scope amenities (for selection UI)
  const roomScopeAmenities = await getRoomScopeAmenities();

  async function createRoom(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const maxGuests = Number(formData.get("max_guests")) || null;
    const adultsCapacity = Number(formData.get("adults_capacity")) || null;
    const childrenCapacity = Number(formData.get("children_capacity")) || null;

    // Validation: If both adults and children capacity are set, ensure they don't exceed max_guests
    if (maxGuests && adultsCapacity && childrenCapacity && (adultsCapacity + childrenCapacity > maxGuests)) {
      throw new Error(`Adults capacity (${adultsCapacity}) + Children capacity (${childrenCapacity}) cannot exceed Max guests (${maxGuests})`);
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("rooms").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      max_guests: maxGuests,
      adults_capacity: adultsCapacity,
      children_capacity: childrenCapacity,
      room_size_sqft: Number(formData.get("room_size_sqft")) || null,
      view_type: String(formData.get("view_type") ?? "").trim() || null,
      is_active: true,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteRoom(formData: FormData) {
    "use server";
    const roomId = String(formData.get("roomId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("rooms").delete().eq("id", roomId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateRoom(formData: FormData) {
    "use server";
    const roomId = String(formData.get("roomId"));
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const maxGuests = Number(formData.get("max_guests")) || null;
    const adultsCapacity = Number(formData.get("adults_capacity")) || null;
    const childrenCapacity = Number(formData.get("children_capacity")) || null;

    // Validation: If both adults and children capacity are set, ensure they don't exceed max_guests
    if (maxGuests && adultsCapacity && childrenCapacity && (adultsCapacity + childrenCapacity > maxGuests)) {
      throw new Error(`Adults capacity (${adultsCapacity}) + Children capacity (${childrenCapacity}) cannot exceed Max guests (${maxGuests})`);
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("rooms")
      .update({
        name,
        description: String(formData.get("description") ?? "").trim() || null,
        max_guests: maxGuests,
        adults_capacity: adultsCapacity,
        children_capacity: childrenCapacity,
        room_size_sqft: Number(formData.get("room_size_sqft")) || null,
        view_type: String(formData.get("view_type") ?? "").trim() || null,
      })
      .eq("id", roomId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function addBed(formData: FormData) {
    "use server";
    const roomId = String(formData.get("roomId"));
    const bedType = String(formData.get("bed_type") ?? "").trim();
    const bedCount = Number(formData.get("bed_count")) || 1;
    const isSofaBed = Boolean(formData.get("is_sofa_bed"));
    const isExtraBed = Boolean(formData.get("is_extra_bed"));

    if (!bedType) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("bed_configurations").insert({
      room_id: roomId,
      tenant_id: tenantId,
      bed_type: bedType,
      bed_count: bedCount,
      is_sofa_bed: isSofaBed,
      is_extra_bed: isExtraBed,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteBed(formData: FormData) {
    "use server";
    const bedId = String(formData.get("bedId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("bed_configurations").delete().eq("id", bedId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateRoomAmenities(formData: FormData) {
    "use server";
    const roomId = String(formData.get("roomId"));
    const supabase = await createSupabaseServerClient();
    const selectedAmenities = formData.getAll("amenity") as string[];

    // Delete all existing
    await supabase
      .from("room_amenities")
      .delete()
      .eq("room_id", roomId);

    // Insert selected
    if (selectedAmenities.length > 0) {
      await supabase.from("room_amenities").insert(
        selectedAmenities.map((amenityId) => ({
          room_id: roomId,
          amenity_id: amenityId,
        })),
      );
    }

    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Rooms</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Manage room types and configurations for this property.
      </p>

      <RoomsManager
        rooms={rooms}
        bedsMap={bedsMap}
        roomAmenitiesMap={roomAmenitiesMap}
        roomScopeAmenities={roomScopeAmenities}
        propertyId={propertyId}
        tenantId={tenantId}
        createRoom={createRoom}
        updateRoom={updateRoom}
        deleteRoom={deleteRoom}
        addBed={addBed}
        deleteBed={deleteBed}
        updateRoomAmenities={updateRoomAmenities}
      />
    </div>
  );
}

