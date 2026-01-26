"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaSelection } from "./MediaSelectionManager";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

function BulkAssignForm({
  onAssign,
  onCancel,
  rooms,
  hosts,
  disabled,
}: {
  onAssign: (mediaType: string, roomId: string | null, hostId: string | null) => Promise<void>;
  onCancel: () => void;
  rooms: Array<{ id: string; name: string }>;
  hosts?: Array<{ id: string; name: string }>;
  disabled: boolean;
}) {
  const [mediaType, setMediaType] = useState("hero");
  const [roomId, setRoomId] = useState("");
  const [hostId, setHostId] = useState("");
  const [loading, setLoading] = useState(false);

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
      await onAssign(mediaType, roomId || null, hostId || null);
    } catch (error) {
      console.error("Bulk assign error:", error);
      alert("Failed to assign images: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
        className="text-sm border border-zinc-300 rounded px-3 py-1.5 bg-white text-zinc-900"
        required
        disabled={loading || disabled}
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
          className="text-sm border border-zinc-300 rounded px-3 py-1.5 bg-white text-zinc-900"
          required
          disabled={loading || disabled}
        >
          <option value="">Select room</option>
          {rooms.map((room) => (
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
          className="text-sm border border-zinc-300 rounded px-3 py-1.5 bg-white text-zinc-900"
          required
          disabled={loading || disabled}
        >
          <option value="">Select host</option>
          {hosts?.map((host) => (
            <option key={host.id} value={host.id}>
              {host.name}
            </option>
          ))}
        </select>
      )}
      <button
        type="submit"
        disabled={loading || disabled}
        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Assigning..." : "Assign"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading || disabled}
        className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
      >
        Cancel
      </button>
    </form>
  );
}

interface MediaSelectionToolbarProps {
  onBulkAssign: (mediaIds: string[], mediaType: string, roomId: string | null, hostId: string | null) => Promise<void>;
  onBulkDelete: (mediaIds: string[]) => Promise<void>;
  rooms: Array<{ id: string; name: string }>;
  hosts?: Array<{ id: string; name: string }>;
  allMediaIds: string[];
}

export function MediaSelectionToolbar({
  onBulkAssign,
  onBulkDelete,
  rooms,
  hosts,
  allMediaIds,
}: MediaSelectionToolbarProps) {
  const { selectedIds, clearSelection, selectAll } = useMediaSelection();
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const selectedCount = selectedIds.size;
  const selectedArray = Array.from(selectedIds);
  const allSelected = selectedCount > 0 && selectedCount === allMediaIds.length;

  if (selectedCount === 0) {
    return null;
  }

  async function handleBulkAssign(mediaType: string, roomId: string | null, hostId: string | null) {
    if (selectedArray.length === 0) return;
    setAssigning(true);
    try {
      await onBulkAssign(selectedArray, mediaType, roomId, hostId);
      clearSelection();
      setShowAssignForm(false);
      router.refresh();
    } catch (error) {
      console.error("Bulk assign error:", error);
      alert("Failed to assign images: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setAssigning(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedArray.length === 0) return;
    setDeleting(true);
    try {
      await onBulkDelete(selectedArray);
      clearSelection();
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete images: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-4 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-blue-900">
            ✓ {selectedCount} image{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            onClick={() => selectAll(allMediaIds)}
            disabled={allSelected}
            className="text-sm text-blue-700 hover:text-blue-900 underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allSelected ? "All selected" : "Select All"}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm text-blue-700 hover:text-blue-900 underline"
          >
            Clear selection
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!showAssignForm ? (
            <>
              <button
                type="button"
                onClick={() => setShowAssignForm(true)}
                disabled={assigning || deleting}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Assign Selected
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                disabled={assigning || deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Delete Selected
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 border-2 border-blue-300 rounded-lg p-3 bg-white">
              <BulkAssignForm
                onAssign={handleBulkAssign}
                onCancel={() => setShowAssignForm(false)}
                rooms={rooms}
                hosts={hosts}
                disabled={assigning || deleting}
              />
            </div>
          )}
        </div>
      </div>
      
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        count={selectedCount}
        isDeleting={deleting}
      />
    </div>
  );
}
