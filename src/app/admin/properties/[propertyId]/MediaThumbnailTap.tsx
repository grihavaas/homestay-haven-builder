"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type MoveDestination = {
  label: string;
  mediaType: "hero" | "room_image" | "host_image" | "gallery";
  roomId?: string | null;
  hostId?: string | null;
};

export function MediaThumbnailTap({
  id,
  src,
  alt,
  onMoveTo,
  onDelete,
  destinations,
  showReorder,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onAfterAction,
}: {
  id: string;
  src: string;
  alt: string;
  onMoveTo: (mediaId: string, dest: MoveDestination) => Promise<void>;
  onDelete: (mediaId: string) => Promise<void>;
  destinations: MoveDestination[];
  showReorder?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onAfterAction?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const router = useRouter();

  const afterAction = onAfterAction ?? (() => router.refresh());

  async function handleMoveTo(dest: MoveDestination) {
    setMenuOpen(false);
    setShowMoveTo(false);
    try {
      await onMoveTo(id, dest);
      afterAction();
    } catch (err) {
      console.error(err);
      alert("Failed to move. Please try again.");
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    try {
      await onDelete(id);
      afterAction();
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-400 border-t-transparent" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-xs text-zinc-500">Failed to load</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${loading || error ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        loading="lazy"
      />
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="absolute inset-0 z-20 block w-full h-full"
        aria-label="Open actions"
      />
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image actions"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setMenuOpen(false); setShowMoveTo(false); }}
            aria-hidden
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-4 w-full max-w-sm shadow-xl flex flex-col gap-2">
            {showMoveTo ? (
              <>
                <div className="text-sm font-medium text-zinc-900">Move to…</div>
                <ul className="max-h-48 overflow-y-auto">
                  {destinations.map((d) => (
                    <li key={`${d.mediaType}-${d.roomId ?? ""}-${d.hostId ?? ""}`}>
                      <button
                        type="button"
                        onClick={() => handleMoveTo(d)}
                        className="w-full text-left py-2 px-3 text-sm text-blue-600 hover:bg-zinc-100 rounded-md"
                      >
                        {d.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setShowMoveTo(false)}
                  className="text-sm text-zinc-600"
                >
                  Back
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowMoveTo(true)}
                  className="w-full py-3 text-left px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 rounded-md"
                >
                  Move to…
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full py-3 text-left px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  Delete
                </button>
                {showReorder && onMoveUp && onMoveDown && (
                  <>
                    <button
                      type="button"
                      onClick={() => { onMoveUp(); setMenuOpen(false); }}
                      disabled={!canMoveUp}
                      className="w-full py-3 text-left px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-md disabled:opacity-50"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => { onMoveDown(); setMenuOpen(false); }}
                      disabled={!canMoveDown}
                      className="w-full py-3 text-left px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-md disabled:opacity-50"
                    >
                      Move down
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-3 text-sm text-zinc-500"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
