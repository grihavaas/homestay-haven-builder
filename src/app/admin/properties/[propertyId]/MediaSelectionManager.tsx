"use client";

import { useState, createContext, useContext, ReactNode } from "react";

interface MediaSelectionContextType {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

const MediaSelectionContext = createContext<MediaSelectionContextType | null>(null);

export function MediaSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: string) => {
    return selectedIds.has(id);
  };

  return (
    <MediaSelectionContext.Provider
      value={{
        selectedIds,
        toggleSelection,
        selectAll,
        clearSelection,
        isSelected,
      }}
    >
      {children}
    </MediaSelectionContext.Provider>
  );
}

export function useMediaSelection() {
  const context = useContext(MediaSelectionContext);
  if (!context) {
    // Return a safe default instead of throwing
    return {
      selectedIds: new Set<string>(),
      toggleSelection: () => {},
      selectAll: () => {},
      clearSelection: () => {},
      isSelected: () => false,
    };
  }
  return context;
}
