"use client";

import { useState, useEffect } from "react";
import { BottomSheet, BottomSheetField, BottomSheetActions } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ImagePicker } from "../ImagePicker";

interface HeroEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeroEditor({ isOpen, onClose }: HeroEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
  });
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Get current hero image
  const currentHeroImage = property?.media?.find(
    (m: any) => m.media_type === "hero" || m.media_type === "gallery"
  )?.s3_url;

  // Initialize form data when property loads or editor opens
  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        name: property.name || "",
        tagline: property.tagline || "",
      });
      setHeroImage(currentHeroImage || null);
    }
  }, [property, isOpen, currentHeroImage]);

  const handleImageSelect = (mediaId: string, url: string) => {
    setSelectedMediaId(mediaId);
    setHeroImage(url);
  };

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("properties")
        .update({
          name: formData.name.trim(),
          tagline: formData.tagline.trim() || null,
        })
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Hero section updated successfully.",
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Hero Section">
      <div className="space-y-6">
        <BottomSheetField label="Hero Image">
          <ImagePicker
            currentImage={heroImage}
            onImageSelect={handleImageSelect}
            mediaType="hero"
            aspectRatio="video"
          />
        </BottomSheetField>

        <BottomSheetField label="Property Name">
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter property name"
            className="text-base"
          />
        </BottomSheetField>

        <BottomSheetField label="Tagline">
          <Textarea
            value={formData.tagline}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tagline: e.target.value }))
            }
            placeholder="A short, memorable tagline"
            rows={2}
            className="text-base resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Appears below the property name
          </p>
        </BottomSheetField>

        <BottomSheetActions>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </BottomSheetActions>
      </div>
    </BottomSheet>
  );
}
