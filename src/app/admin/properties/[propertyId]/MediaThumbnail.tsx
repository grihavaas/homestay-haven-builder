"use client";

import { useState } from "react";
import { AssignMediaForm } from "./AssignMediaForm";
import { useMediaSelection } from "./MediaSelectionManager";

export function MediaThumbnail({
  id,
  src,
  alt,
  mediaType,
  onDelete,
  onRemove,
  onAssign,
  rooms,
  hosts,
  showOrderNumber,
}: {
  id: string;
  src: string;
  alt: string;
  mediaType: string;
  onDelete?: (id: string) => void;
  onRemove?: (id: string) => void;
  onAssign?: (id: string, mediaType: string, roomId: string | null, hostId: string | null) => Promise<void>;
  rooms?: Array<{ id: string; name: string }>;
  hosts?: Array<{ id: string; name: string }>;
  showOrderNumber?: number;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const { isSelected, toggleSelection, selectedIds } = useMediaSelection();
  const selected = isSelected(id);
  const hasSelections = selectedIds.size > 0;

  const isGallery = mediaType === "other";
  const canDelete = isGallery && onDelete;
  const canRemove = !isGallery && onRemove;
  const canAssign = isGallery && onAssign;

  return (
    <div className={`relative group aspect-square overflow-hidden ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 rounded-md z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 rounded-md z-10">
          <span className="text-xs text-zinc-500">Failed to load</span>
        </div>
      )}
      <div className="absolute top-2 left-2 z-10 flex items-end gap-1.5">
        <div
          className="checkbox-container flex items-center"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelection(id);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white shadow-sm"
          />
        </div>
        {showOrderNumber && (
          <div className="bg-black/50 text-white text-xs px-1 py-0.5 rounded pointer-events-none leading-tight flex items-center" style={{ height: '20px' }}>
            {showOrderNumber}
          </div>
        )}
      </div>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-md ${
          loading || error ? "opacity-0" : "opacity-100"
        } transition-opacity ${selected ? "opacity-70" : ""}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        loading="lazy"
        decoding="async"
      />
      {!hasSelections && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
          {canDelete && (
            <form action={onDelete!.bind(null, id)}>
              <button
                type="submit"
                className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </form>
          )}
          {canRemove && (
            <form action={onRemove!.bind(null, id)}>
              <button
                type="submit"
                className="bg-orange-600 text-white text-xs px-2 py-1 rounded hover:bg-orange-700"
              >
                Remove
              </button>
            </form>
          )}
          {canAssign && (
            <>
              <button
                type="button"
                onClick={() => setShowAssign(!showAssign)}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
              >
                Assign
              </button>
            </>
          )}
        </div>
      )}
      {showAssign && canAssign && onAssign && !hasSelections && (
        <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-md p-2 z-30 shadow-lg">
          <div className="flex flex-col gap-2 h-full">
            <AssignMediaForm
              mediaId={id}
              onAssign={onAssign}
              rooms={rooms}
              hosts={hosts}
              onClose={() => setShowAssign(false)}
            />
            <button
              type="button"
              onClick={() => setShowAssign(false)}
              className="bg-zinc-400 text-white text-xs px-2 py-1 rounded hover:bg-zinc-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
