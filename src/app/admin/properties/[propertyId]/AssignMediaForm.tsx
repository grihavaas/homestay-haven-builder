"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AssignMediaForm({
  mediaId,
  onAssign,
  rooms,
  hosts,
  onClose,
}: {
  mediaId: string;
  onAssign: (mediaId: string, mediaType: string, roomId: string | null, hostId: string | null) => Promise<void>;
  rooms?: Array<{ id: string; name: string }>;
  hosts?: Array<{ id: string; name: string }>;
  onClose?: () => void;
}) {
  const [mediaType, setMediaType] = useState("hero");
  const [roomId, setRoomId] = useState("");
  const [hostId, setHostId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mediaType === "room_image" && !roomId) {
      alert("Please select a room");
      return;
    }
    if (mediaType === "host_image" && !hostId) {
      alert("Please select a host");
      return;
    }
    setLoading(true);
    try {
      await onAssign(mediaId, mediaType, roomId || null, hostId || null);
      if (onClose) onClose();
      router.refresh();
    } catch (error) {
      console.error("Assign error:", error);
      alert("Failed to assign image: " + (error instanceof Error ? error.message : "Unknown error"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div className="text-xs font-semibold text-zinc-900">Assign to:</div>
      <select
        value={mediaType}
        onChange={(e) => {
          setMediaType(e.target.value);
          if (e.target.value !== "room_image") {
            setRoomId("");
          }
          if (e.target.value !== "host_image") {
            setHostId("");
          }
        }}
        className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white text-zinc-900"
        required
        disabled={loading}
      >
        <option value="hero">Hero</option>
        <option value="room_image">Room Image</option>
        <option value="host_image">Host Image</option>
        <option value="exterior">Exterior</option>
        <option value="common_area">Common Area</option>
        <option value="gallery">Gallery</option>
      </select>
      {mediaType === "room_image" && (
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white text-zinc-900"
          required
          disabled={loading}
        >
          <option value="">Select room</option>
          {rooms?.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      )}
      {mediaType === "host_image" && (
        <select
          value={hostId}
          onChange={(e) => setHostId(e.target.value)}
          className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white text-zinc-900"
          required
          disabled={loading}
        >
          <option value="">Select host</option>
          {hosts?.map((host) => (
            <option key={host.id} value={host.id}>
              {host.name}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-1 mt-auto">
        <button
          type="submit"
          className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Assigning..." : "Save"}
        </button>
      </div>
    </form>
  );
}
