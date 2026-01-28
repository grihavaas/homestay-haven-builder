"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { cn } from "@/lib/utils";

interface EditableSectionProps {
  sectionId: string;
  children: ReactNode;
  onEdit: () => void;
  className?: string;
  editButtonPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  editButtonLabel?: string;
}

export function EditableSection({
  sectionId,
  children,
  onEdit,
  className,
  editButtonPosition = "top-right",
  editButtonLabel = "Edit",
}: EditableSectionProps) {
  const { isEditMode, activeEditor } = useEditMode();

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const handleEdit = () => {
    if (isEditMode) {
      onEdit();
    }
  };

  return (
    <div
      className={cn(
        "relative group",
        isEditMode && "cursor-pointer",
        className
      )}
      onClick={handleEdit}
    >
      {/* Edit mode overlay and button */}
      {isEditMode && (
        <>
          {/* Subtle highlight on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-primary/50 rounded-lg transition-colors z-10"
          />

          {/* Edit button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "absolute z-20 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity",
              positionClasses[editButtonPosition]
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            {editButtonLabel}
          </motion.button>
        </>
      )}

      {children}
    </div>
  );
}

// Simpler inline edit button for use inside components
export function EditButton({
  onClick,
  label = "Edit",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  const { isEditMode } = useEditMode();

  if (!isEditMode) {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow-lg",
        className
      )}
    >
      <Pencil className="w-3.5 h-3.5" />
      {label}
    </motion.button>
  );
}
