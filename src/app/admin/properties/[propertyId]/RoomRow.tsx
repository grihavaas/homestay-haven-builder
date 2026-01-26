"use client";

import { useRouter } from "next/navigation";
import type { Room } from "./RoomsList";

interface BedConfiguration {
  id: string;
  bed_type: string;
  bed_count: number;
  is_sofa_bed: boolean;
  is_extra_bed: boolean;
}

interface RoomRowProps {
  room: Room;
  beds: BedConfiguration[];
  roomAmenities: Set<string>;
  roomScopeAmenities: Array<{ id: string; name: string; category: string | null }>;
  propertyId: string;
  tenantId: string;
  isEditing: boolean;
  onEdit: (roomId: string | null) => void;
  updateRoom: (formData: FormData) => Promise<void>;
  deleteRoom: (formData: FormData) => Promise<void>;
  addBed: (formData: FormData) => Promise<void>;
  deleteBed: (formData: FormData) => Promise<void>;
  updateRoomAmenities: (formData: FormData) => Promise<void>;
}

export function RoomRow({
  room,
  beds,
  roomAmenities,
  roomScopeAmenities,
  propertyId,
  tenantId,
  isEditing,
  onEdit,
  updateRoom,
  deleteRoom,
  addBed,
  deleteBed,
  updateRoomAmenities,
}: RoomRowProps) {
  const router = useRouter();

  if (isEditing) {
    return (
      <div className="p-3">
        <form
          action={async (formData: FormData) => {
            formData.append("roomId", room.id);
            await updateRoom(formData);
            onEdit(null);
            router.refresh();
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Edit Room</h4>
            <button
              type="button"
              onClick={() => onEdit(null)}
              className="text-xs text-zinc-600 hover:underline"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Room Name</div>
              <input
                name="name"
                defaultValue={room.name}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">View Type</div>
              <select
                name="view_type"
                defaultValue={room.view_type || ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Select view type</option>
                <option value="Sea view">Sea view</option>
                <option value="Ocean view">Ocean view</option>
                <option value="Beach view">Beach view</option>
                <option value="Garden view">Garden view</option>
                <option value="Mountain view">Mountain view</option>
                <option value="City view">City view</option>
                <option value="Pool view">Pool view</option>
                <option value="Lake view">Lake view</option>
                <option value="River view">River view</option>
                <option value="Forest view">Forest view</option>
                <option value="Courtyard view">Courtyard view</option>
                <option value="No view">No view</option>
              </select>
            </label>
          </div>
          <label className="block">
            <div className="text-sm font-medium">Description</div>
            <textarea
              name="description"
              defaultValue={room.description || ""}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <div className="rounded-md border p-4 space-y-3 bg-zinc-50">
            <h5 className="text-sm font-semibold">Guest Capacity</h5>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <div className="text-sm font-medium">Max Guests *</div>
                <input
                  name="max_guests"
                  type="number"
                  min="1"
                  defaultValue={room.max_guests || ""}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
                <p className="mt-1 text-xs text-zinc-500">Total capacity (adults + children)</p>
              </label>
              <label className="block">
                <div className="text-sm font-medium">Adults Capacity</div>
                <input
                  name="adults_capacity"
                  type="number"
                  min="1"
                  defaultValue={room.adults_capacity || ""}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">Optional: Max adults (e.g., 2 for 1 king bed)</p>
              </label>
              <label className="block">
                <div className="text-sm font-medium">Children Capacity</div>
                <input
                  name="children_capacity"
                  type="number"
                  min="0"
                  defaultValue={room.children_capacity || ""}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">Optional: Max children (via extra beds/cribs)</p>
              </label>
            </div>
            <p className="text-xs text-zinc-600">
              💡 <strong>Tip:</strong> Common pattern is "2 adults + 2 children". 
              If adults + children ≤ max guests, the breakdown will be shown on the website.
            </p>
          </div>
          <label className="block">
            <div className="text-sm font-medium">Room Size (sqft)</div>
            <input
              name="room_size_sqft"
              type="number"
              min="0"
              defaultValue={room.room_size_sqft || ""}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          {/* Bed Management Section */}
          <div className="rounded-md border p-4 space-y-3 bg-zinc-50">
            <h5 className="text-sm font-semibold">Bed Configurations</h5>
            {beds.length > 0 ? (
              <div className="space-y-2">
                {beds.map((bed) => (
                  <div key={bed.id} className="flex items-center justify-between rounded-md border bg-white p-2 text-sm">
                    <span>
                      {bed.bed_count}x {bed.bed_type}
                      {bed.is_sofa_bed && " (Sofa Bed)"}
                      {bed.is_extra_bed && " (Extra Bed)"}
                    </span>
                    <form action={async (formData: FormData) => {
                      formData.append("bedId", bed.id);
                      await deleteBed(formData);
                      router.refresh();
                    }} className="inline">
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No beds configured</p>
            )}
            <form action={async (formData: FormData) => {
              formData.append("roomId", room.id);
              await addBed(formData);
              router.refresh();
            }} className="flex gap-2">
              <select
                name="bed_type"
                className="flex-1 rounded-md border px-2 py-1 text-xs"
                required
              >
                <option value="">Select bed type</option>
                <option value="King">King</option>
                <option value="Queen">Queen</option>
                <option value="Twin">Twin</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
              </select>
              <input
                name="bed_count"
                type="number"
                min="1"
                defaultValue="1"
                className="w-16 rounded-md border px-2 py-1 text-xs"
              />
              <label className="flex items-center gap-1 text-xs">
                <input name="is_sofa_bed" type="checkbox" />
                Sofa
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input name="is_extra_bed" type="checkbox" />
                Extra
              </label>
              <button
                type="submit"
                className="rounded-md bg-zinc-800 px-3 py-1 text-xs text-white"
              >
                Add Bed
              </button>
            </form>
          </div>

          {/* Room Amenities Section */}
          <div className="rounded-md border p-4 space-y-3 bg-zinc-50">
            <h5 className="text-sm font-semibold">Room Amenities</h5>
            <form
              action={async (formData: FormData) => {
                formData.append("roomId", room.id);
                await updateRoomAmenities(formData);
                router.refresh();
              }}
            >
              <input type="hidden" name="roomId" value={room.id} />
              <div className="max-h-64 space-y-3 overflow-y-auto rounded-md border bg-white p-3">
                {Object.entries(
                  roomScopeAmenities.reduce((acc, amenity) => {
                    const cat = amenity.category || "Other";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(amenity);
                    return acc;
                  }, {} as Record<string, typeof roomScopeAmenities>)
                ).map(([category, items]) => (
                  <div key={category}>
                    <h6 className="mb-2 text-xs font-medium text-zinc-700">{category}</h6>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {items.map((amenity) => (
                        <label
                          key={amenity.id}
                          className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-zinc-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            name="amenity"
                            value={amenity.id}
                            defaultChecked={roomAmenities.has(amenity.id)}
                            className="flex-shrink-0"
                          />
                          <span className="truncate">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="mt-3 rounded-md bg-zinc-800 px-3 py-1 text-xs text-white"
              >
                Save Amenities
              </button>
            </form>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm text-white"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => onEdit(null)}
              className="rounded-md border px-4 py-2 text-sm text-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="grid grid-cols-[2fr_1fr_auto] gap-2 text-sm">
        <div>
          <div className="font-medium">{room.name}</div>
          {room.description && (
            <div className="mt-1 text-xs text-zinc-600">{room.description}</div>
          )}
          {beds.length > 0 && (
            <div className="mt-1 text-xs text-zinc-500">
              Beds: {beds.map((b) => `${b.bed_count}x ${b.bed_type}`).join(", ")}
            </div>
          )}
        </div>
        <div>
          {room.max_guests ? `${room.max_guests} guests` : "—"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(room.id)}
            className="text-xs text-blue-600 hover:underline"
          >
            Edit
          </button>
          <form action={deleteRoom}>
            <input type="hidden" name="roomId" value={room.id} />
            <button
              type="submit"
              className="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
