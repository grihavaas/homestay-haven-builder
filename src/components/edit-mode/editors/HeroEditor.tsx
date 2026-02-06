"use client";

import { useState, useEffect, useRef } from "react";
import { BottomSheet, BottomSheetField, BottomSheetActions } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { Loader2, ChevronUp, ChevronDown, Plus, X } from "lucide-react";

const SAVE_TIMEOUT_MS = 15000;

interface HeroEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

type MediaItem = { id: string; s3_url: string; media_type: string; display_order: number | null };

export function HeroEditor({ isOpen, onClose }: HeroEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formData, setFormData] = useState({ name: "", tagline: "" });
  /** Ordered list of media IDs that are "main" (hero) images. */
  const [mainImageIds, setMainImageIds] = useState<string[]>([]);
  const [showAddPicker, setShowAddPicker] = useState(false);

  const allMedia: MediaItem[] = property?.media ?? [];
  const heroMediaSorted = allMedia
    .filter((m) => m.media_type === "hero")
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const mainImages = mainImageIds
    .map((id) => allMedia.find((m) => m.id === id))
    .filter(Boolean) as MediaItem[];
  /** Media that can be "added to main" (gallery, etc.) and are not already main. */
  const addableMedia = allMedia.filter(
    (m) =>
      (m.media_type === "gallery" || m.media_type === "other" || m.media_type === "exterior" || m.media_type === "common_area") &&
      !mainImageIds.includes(m.id)
  );

  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        name: property.name || "",
        tagline: property.tagline || "",
      });
      setMainImageIds(heroMediaSorted.map((m) => m.id));
    }
  }, [property, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps -- only sync when open/property change

  useEffect(() => {
    if (!isOpen) setShowAddPicker(false);
  }, [isOpen]);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setMainImageIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= mainImageIds.length - 1) return;
    setMainImageIds((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const removeFromMain = (id: string) => {
    setMainImageIds((prev) => prev.filter((x) => x !== id));
  };

  const addToMain = (id: string) => {
    setMainImageIds((prev) => [...prev, id]);
    setShowAddPicker(false);
  };

  const clearSaveTimeout = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    clearSaveTimeout();

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      setSaving(false);
      toast({
        title: "Request timed out",
        description: "Save took too long. Check your connection and try again.",
        variant: "destructive",
      });
    }, SAVE_TIMEOUT_MS);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error: propError } = await supabase
        .from("properties")
        .update({
          name: formData.name.trim(),
          tagline: formData.tagline.trim() || null,
        })
        .eq("id", property.id);

      if (propError) {
        throw new Error(propError.message || "Failed to update property");
      }

      const newMainSet = new Set(mainImageIds);

      for (const m of heroMediaSorted) {
        if (!newMainSet.has(m.id)) {
          const { error } = await supabase
            .from("media")
            .update({ media_type: "gallery", display_order: 999 })
            .eq("id", m.id);
          if (error) throw new Error(error.message || "Failed to update media");
        }
      }

      for (let i = 0; i < mainImageIds.length; i++) {
        const { error } = await supabase
          .from("media")
          .update({ media_type: "hero", display_order: i })
          .eq("id", mainImageIds[i]);
        if (error) throw new Error(error.message || "Failed to update media");
      }

      clearSaveTimeout();
      setSaving(false);
      toast({ title: "Changes saved.", description: "Your updates have been saved." });
      onClose();
      window.location.reload();
    } catch (err) {
      clearSaveTimeout();
      setSaving(false);
      const message = err instanceof Error ? err.message : "Failed to save changes. Please try again.";
      console.error("HeroEditor save error:", err);
      toast({
        title: "Couldn't save",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit main banner">
      <div className="space-y-6">
        <BottomSheetField label="Main images">
          <p className="text-xs text-muted-foreground mb-2">
            These images appear in the banner at the top. First image is the default.
          </p>
          <ul className="space-y-2">
            {mainImages.map((m, index) => (
              <li
                key={m.id}
                className="flex items-center gap-2 rounded-lg border bg-muted/30 overflow-hidden"
              >
                <img
                  src={m.s3_url}
                  alt=""
                  className="h-14 w-20 object-cover flex-shrink-0"
                />
                <span className="text-sm truncate flex-1 min-w-0">
                  Main image {index + 1}
                </span>
                <div className="flex items-center flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveDown(index)}
                    disabled={index === mainImages.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromMain(m.id)}
                    aria-label="Remove from main"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {addableMedia.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setShowAddPicker(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to main
              </Button>
              {showAddPicker && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
                  <div className="bg-background rounded-lg shadow-xl w-full max-w-md max-h-[70vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                      <span className="font-medium">Add to main images</span>
                      <Button variant="ghost" size="icon" onClick={() => setShowAddPicker(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-2">
                      {addableMedia.map((media) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => addToMain(media.id)}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary focus:ring-2 focus:ring-primary/50"
                        >
                          <img
                            src={media.s3_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {mainImages.length === 0 && addableMedia.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add photos in the Media section, then use &quot;Add to main&quot; here to show them in the banner.
            </p>
          )}
        </BottomSheetField>

        <BottomSheetField label="Property name">
          <Input
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter property name"
            className="text-base"
          />
        </BottomSheetField>

        <BottomSheetField label="Tagline">
          <Textarea
            value={formData.tagline}
            onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
            placeholder="A short, memorable tagline"
            rows={2}
            className="text-base resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Appears below the property name
          </p>
        </BottomSheetField>

        <BottomSheetActions>
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </BottomSheetActions>
      </div>
    </BottomSheet>
  );
}
