"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import {
  BottomSheet,
  BottomSheetField,
  BottomSheetActions,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { themeList, ThemeId } from "@/lib/themes";

interface ThemeEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeEditor({ isOpen, onClose }: ThemeEditorProps) {
  const { property } = useProperty();
  const { currentTheme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(
    (property?.theme as ThemeId) || currentTheme || 'backwater'
  );
  const [saving, setSaving] = useState(false);

  // Preview theme when selecting (before saving)
  const handleThemeSelect = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    setTheme(themeId); // Live preview
  };

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({ theme: selectedTheme })
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Theme updated successfully.",
      });

      onClose();
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        title: "Error",
        description: "Failed to save theme. Please try again.",
        variant: "destructive",
      });
      // Revert to original theme on error
      setTheme(currentTheme);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Revert to saved theme if not saving
    const savedTheme = (property?.theme as ThemeId) || 'backwater';
    setTheme(savedTheme);
    setSelectedTheme(savedTheme);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Choose Theme">
      <div className="space-y-6">
        <BottomSheetField label="Select a theme for your property">
          <div className="grid grid-cols-1 gap-3">
            {themeList.map((theme) => (
              <motion.button
                key={theme.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleThemeSelect(theme.id)}
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedTheme === theme.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Theme color preview */}
                <div
                  className="w-12 h-12 rounded-full flex-shrink-0"
                  style={{ background: theme.previewGradient }}
                />

                {/* Theme info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{theme.name}</div>
                  <div className="text-sm text-muted-foreground">{theme.tagline}</div>
                </div>

                {/* Selected indicator */}
                {selectedTheme === theme.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </BottomSheetField>

        <BottomSheetActions>
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Theme"
            )}
          </Button>
        </BottomSheetActions>
      </div>
    </BottomSheet>
  );
}
