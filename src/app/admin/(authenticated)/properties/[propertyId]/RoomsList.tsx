
export interface Room {
  id: string;
  name: string;
  description: string | null;
  max_guests: number | null;
  adults_capacity: number | null;
  children_capacity: number | null;
  extra_beds_available: boolean;
  extra_beds_count: number;
  room_size_sqft: number | null;
  view_type: string | null;
  is_active: boolean;
}

interface BedConfiguration {
  id: string;
  bed_type: string;
  bed_count: number;
  is_sofa_bed: boolean;
  is_extra_bed: boolean;
}

interface RoomsListProps {
  rooms: Room[];
  bedsMap: Record<string, BedConfiguration[]>;
  roomAmenitiesMap: Record<string, Set<string>>;
  roomScopeAmenities: Array<{ id: string; name: string; category: string | null }>;
  propertyId: string;
  tenantId: string;
  editRoomId: string | null;
  onEdit: (roomId: string | null) => void;
  updateRoom: (formData: FormData) => Promise<void>;
  deleteRoom: (formData: FormData) => Promise<void>;
  addBed: (formData: FormData) => Promise<void>;
  deleteBed: (formData: FormData) => Promise<void>;
  updateRoomAmenities: (formData: FormData) => Promise<void>;
}

export function RoomsList({ rooms, bedsMap, roomAmenitiesMap, roomScopeAmenities, propertyId, tenantId, editRoomId, onEdit, updateRoom, deleteRoom, addBed, deleteBed, updateRoomAmenities }: RoomsListProps) {

  return (
    <div className="mt-8 rounded-lg border">
      <div className="grid grid-cols-[2fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
        <div>Room</div>
        <div>Capacity</div>
        <div>Actions</div>
      </div>
      <div className="divide-y">
        {rooms.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            beds={bedsMap[room.id] || []}
            roomAmenities={roomAmenitiesMap[room.id] || new Set()}
            roomScopeAmenities={roomScopeAmenities}
            propertyId={propertyId}
            tenantId={tenantId}
            isEditing={editRoomId === room.id}
            onEdit={onEdit}
            updateRoom={updateRoom}
            deleteRoom={deleteRoom}
            addBed={addBed}
            deleteBed={deleteBed}
            updateRoomAmenities={updateRoomAmenities}
          />
        ))}
        {rooms.length === 0 ? (
          <div className="p-3 text-sm text-zinc-600">No rooms yet.</div>
        ) : null}
      </div>
    </div>
  );
}
import { RoomRow } from "./RoomRow";
