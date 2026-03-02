"use client";

import { useState } from "react";
import { RoomsForm } from "./RoomsForm";
import { RoomsList } from "./RoomsList";

interface Room {
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

interface RoomsManagerProps {
  rooms: Room[];
  bedsMap: Record<string, BedConfiguration[]>;
  roomAmenitiesMap: Record<string, Set<string>>;
  roomScopeAmenities: Array<{ id: string; name: string; category: string | null }>;
  propertyId: string;
  tenantId: string;
  createRoom: (formData: FormData) => Promise<void>;
  updateRoom: (formData: FormData) => Promise<void>;
  deleteRoom: (formData: FormData) => Promise<void>;
  addBed: (formData: FormData) => Promise<void>;
  deleteBed: (formData: FormData) => Promise<void>;
  updateRoomAmenities: (formData: FormData) => Promise<void>;
}

export function RoomsManager({ rooms, bedsMap, roomAmenitiesMap, roomScopeAmenities, propertyId, tenantId, createRoom, updateRoom, deleteRoom, addBed, deleteBed, updateRoomAmenities }: RoomsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);

  return (
    <>
      <div className="mt-6">
        <RoomsForm 
          createRoom={createRoom} 
          isOpen={showForm}
          onOpenChange={setShowForm}
        />
      </div>

      {!showForm && (
        <RoomsList
          rooms={rooms}
          bedsMap={bedsMap}
          roomAmenitiesMap={roomAmenitiesMap}
          roomScopeAmenities={roomScopeAmenities}
          propertyId={propertyId}
          tenantId={tenantId}
          editRoomId={editRoomId}
          onEdit={setEditRoomId}
          updateRoom={updateRoom}
          deleteRoom={deleteRoom}
          addBed={addBed}
          deleteBed={deleteBed}
          updateRoomAmenities={updateRoomAmenities}
        />
      )}
    </>
  );
}
