"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, Palette, LayoutGrid, Image, LogOut } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { cn } from "@/lib/utils";

interface EditModeToggleProps {
  onLayoutClick?: () => void;
  onColorsClick?: () => void;
  onMediaClick?: () => void;
}

export function EditModeToggle({ onLayoutClick, onColorsClick, onMediaClick }: EditModeToggleProps) {
  const { isEditMode, canEdit, toggleEditMode, setEditMode } = useEditMode();
  const { user, membership } = useAuth();
  const { property } = useProperty();

  const handleLogout = () => {
    setEditMode(false);
    // POST to server logout route so session cookie is cleared (required for SSR)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/admin/logout";
    document.body.appendChild(form);
    form.submit();
  };

  if (!canEdit) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
        {/* Logout button - only visible in edit mode */}
        {isEditMode && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        )}

        {/* Media button - only visible in edit mode */}
        {isEditMode && onMediaClick && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMediaClick}
            className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Image className="w-5 h-5" />
            <span className="text-sm font-medium">Media</span>
          </motion.button>
        )}

        {/* Colors button - only visible in edit mode */}
        {isEditMode && onColorsClick && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onColorsClick}
            className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Palette className="w-5 h-5" />
            <span className="text-sm font-medium">Colors</span>
          </motion.button>
        )}

        {/* Layout button - only visible in edit mode */}
        {isEditMode && onLayoutClick && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLayoutClick}
            className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-sm font-medium">Layout</span>
          </motion.button>
        )}

        {/* Main edit mode toggle */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleEditMode}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-colors",
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
      </div>
    </AnimatePresence>
  );
}
