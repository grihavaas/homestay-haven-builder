"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Check } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { cn } from "@/lib/utils";

export function EditModeToggle() {
  const { isEditMode, canEdit, toggleEditMode } = useEditMode();

  if (!canEdit) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleEditMode}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-colors",
          isEditMode
            ? "bg-primary text-primary-foreground"
            : "bg-slate-900 text-white hover:bg-slate-800"
        )}
      >
        {isEditMode ? (
          <>
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Done Editing</span>
          </>
        ) : (
          <>
            <Pencil className="w-5 h-5" />
            <span className="text-sm font-medium">Edit Site</span>
          </>
        )}
      </motion.button>
    </AnimatePresence>
  );
}
