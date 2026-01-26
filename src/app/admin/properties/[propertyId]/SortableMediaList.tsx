"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MediaThumbnail } from "./MediaThumbnail";
import { useMediaSelection } from "./MediaSelectionManager";

interface MediaItem {
  id: string;
  s3_url: string;
  alt_text: string | null;
  media_type: string;
  room_id: string | null;
  display_order: number | null;
  is_active: boolean;
}

interface SortableMediaListProps {
  items: MediaItem[];
  rooms: Array<{ id: string; name: string }>;
  hosts?: Array<{ id: string; name: string }>;
  onDelete: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onAssign: (id: string, mediaType: string, roomId: string | null, hostId: string | null) => Promise<void>;
  onUpdateOrder: (mediaId: string, newOrder: number) => Promise<void>;
}

export function SortableMediaList({
  items,
  rooms,
  hosts,
  onDelete,
  onRemove,
  onAssign,
  onUpdateOrder,
}: SortableMediaListProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [sortedItems, setSortedItems] = useState<MediaItem[]>(items);
  const [isReordering, setIsReordering] = useState(false);
  const router = useRouter();
  const { selectedIds } = useMediaSelection();
  const hasSelections = selectedIds.size > 0;

  // Sync with items prop when it changes
  useEffect(() => {
    setSortedItems(items);
  }, [items]);

  // Sort items by display_order
  const sorted = [...sortedItems].sort((a, b) => {
    const orderA = a.display_order ?? 0;
    const orderB = b.display_order ?? 0;
    return orderA - orderB;
  });

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedItem(sorted[index].id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  async function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem) return;

    const draggedIndex = sorted.findIndex((item) => item.id === draggedItem);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedItem(null);
      return;
    }

    // Calculate new order values
    const newItems = [...sorted];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    // Update display_order for all affected items
    const updates: Promise<void>[] = [];
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      if (item.display_order !== i) {
        updates.push(onUpdateOrder(item.id, i));
      }
    }

    // Optimistically update UI
    setSortedItems(newItems);
    setIsReordering(true);

    try {
      await Promise.all(updates);
      router.refresh();
    } catch (error) {
      console.error("Failed to update order:", error);
      // Revert on error
      setSortedItems(items);
      alert("Failed to update order. Please try again.");
    } finally {
      setIsReordering(false);
      setDraggedItem(null);
    }
  }

  function handleDragEnd() {
    setDraggedItem(null);
    setDragOverIndex(null);
  }

  return (
    <div className="relative">
      {isReordering && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-zinc-600">Updating order...</p>
          </div>
        </div>
      )}
      <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 ${isReordering ? "pointer-events-none opacity-60" : ""}`} style={{ pointerEvents: isReordering ? 'none' : 'auto' }}>
        {sorted.map((item, index) => (
          <div
            key={item.id}
            draggable={!isReordering && !hasSelections}
            onDragStart={(e) => {
              // Don't start drag if clicking on checkbox or its container, or if items are selected
              if (hasSelections) {
                e.preventDefault();
                return;
              }
              const target = e.target as HTMLElement;
              if (target.closest('input[type="checkbox"]') || target.closest('.checkbox-container')) {
                e.preventDefault();
                return;
              }
              handleDragStart(e, index);
            }}
            onMouseDown={(e) => {
              // Prevent drag if clicking on checkbox
              const target = e.target as HTMLElement;
              if (target.closest('input[type="checkbox"]') || target.closest('.checkbox-container')) {
                e.stopPropagation();
              }
            }}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative transition-opacity group ${
              draggedItem === item.id ? "opacity-50" : ""
            } ${
              dragOverIndex === index ? "ring-2 ring-blue-500 ring-offset-2" : ""
            } ${isReordering ? "cursor-not-allowed" : hasSelections ? "cursor-default" : "cursor-move"}`}
            style={{ pointerEvents: 'auto', isolation: 'isolate' }}
          >
          <MediaThumbnail
            id={item.id}
            src={item.s3_url}
            alt={item.alt_text || "Property image"}
            mediaType={item.media_type || "other"}
            onRemove={onRemove}
            onDelete={onDelete}
            onAssign={onAssign}
            rooms={rooms}
            hosts={hosts}
            showOrderNumber={index + 1}
          />
        </div>
      ))}
      </div>
    </div>
  );
}
