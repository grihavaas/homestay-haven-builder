"use client";

import { useMediaSelection } from "./MediaSelectionManager";

export function SelectAllButton({ galleryMediaIds }: { galleryMediaIds: string[] }) {
  const { selectedIds, selectAll } = useMediaSelection();
  
  // Only check selection within gallery items
  const selectedGalleryIds = galleryMediaIds.filter(id => selectedIds.has(id));
  const selectedCount = selectedGalleryIds.length;
  const allSelected = galleryMediaIds.length > 0 && selectedCount === galleryMediaIds.length;

  if (galleryMediaIds.length === 0) return null;

  const handleToggle = () => {
    if (allSelected) {
      // Deselect only gallery items, keep other selections
      const newSelection = new Set(selectedIds);
      galleryMediaIds.forEach(id => newSelection.delete(id));
      selectAll(Array.from(newSelection));
    } else {
      // Select all gallery items, keeping other selections
      const newSelection = new Set(selectedIds);
      galleryMediaIds.forEach(id => newSelection.add(id));
      selectAll(Array.from(newSelection));
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="text-xs text-white hover:text-zinc-200 px-2 py-1 border border-zinc-600 rounded-md hover:bg-zinc-800 bg-zinc-700"
    >
      {allSelected ? "Deselect All" : "Select All"}
    </button>
  );
}
