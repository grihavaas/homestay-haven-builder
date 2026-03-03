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
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { themeList, paletteList, ThemeId, PaletteId, defaultPaletteForTheme } from "@/lib/themes";

interface ThemeEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeEditor({ isOpen, onClose }: ThemeEditorProps) {
  const { property, refreshProperty } = useProperty();
  const { currentTheme, setTheme, currentPalette, setPalette } = useTheme();

  const savedTheme = (property?.theme as ThemeId) || "mountain";
  const savedPalette = (property?.palette as PaletteId) || defaultPaletteForTheme[savedTheme];

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(savedTheme);
  const [selectedPalette, setSelectedPalette] = useState<PaletteId>(savedPalette);
  const [saving, setSaving] = useState(false);

  const handleThemeSelect = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    setTheme(themeId);
  };

  const handlePaletteSelect = (paletteId: PaletteId) => {
    setSelectedPalette(paletteId);
    setPalette(paletteId);
  };

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("properties")
        .update({ theme: selectedTheme, palette: selectedPalette })
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Layout and palette updated.",
      });

      await refreshProperty();
      onClose();
    } catch (error: any) {
      console.error("Error saving theme:", error);
      toast({
        title: "Error saving",
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
      setTheme(savedTheme);
      setPalette(savedPalette);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTheme(savedTheme);
    setPalette(savedPalette);
    setSelectedTheme(savedTheme);
    setSelectedPalette(savedPalette);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Appearance">
      <div className="space-y-6">
        {/* Layout section */}
        <BottomSheetField label="Layout">
          <div className="grid grid-cols-1 gap-2">
            {themeList.map((theme) => (
              <motion.button
                key={theme.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleThemeSelect(theme.id)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedTheme === theme.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">
                    {theme.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {theme.tagline}
                  </div>
                </div>
                {selectedTheme === theme.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </BottomSheetField>

        {/* Palette section */}
        <BottomSheetField label="Color Palette">
          <div className="grid grid-cols-2 gap-2">
            {paletteList.map((palette) => (
              <motion.button
                key={palette.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePaletteSelect(palette.id)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedPalette === palette.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ background: palette.previewGradient }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {palette.name}
                  </div>
                </div>
                {selectedPalette === palette.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary-foreground" />
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
              "Save"
            )}
          </Button>
        </BottomSheetActions>
      </div>
    </BottomSheet>
  );
}
