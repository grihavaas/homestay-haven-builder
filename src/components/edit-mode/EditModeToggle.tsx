"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, Palette } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import { cn } from "@/lib/utils";

interface EditModeToggleProps {
  onThemeClick?: () => void;
}

export function EditModeToggle({ onThemeClick }: EditModeToggleProps) {
  const { isEditMode, canEdit, toggleEditMode } = useEditMode();
  const { user, membership, loading: authLoading } = useAuth();
  const { property } = useProperty();

  // Debug: Log auth state (remove in production)
  console.log("[EditModeToggle] Auth state:", {
    authLoading,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    hasMembership: !!membership,
    membershipRole: membership?.role,
    membershipTenantId: membership?.tenant_id,
    propertyTenantId: property?.tenant_id,
    canEdit,
  });

  if (!canEdit) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
        {/* Theme button - only visible in edit mode */}
        {isEditMode && onThemeClick && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onThemeClick}
            className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Palette className="w-5 h-5" />
            <span className="text-sm font-medium">Theme</span>
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
