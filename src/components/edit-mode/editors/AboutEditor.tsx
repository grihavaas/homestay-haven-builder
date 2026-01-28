"use client";

import { useState, useEffect } from "react";
import {
  BottomSheet,
  BottomSheetField,
  BottomSheetActions,
} from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AboutEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutEditor({ isOpen, onClose }: AboutEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    property_history: "",
    description: "",
  });

  // Initialize form data when property loads or editor opens
  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        property_history: property.property_history || "",
        description: property.description || "",
      });
    }
  }, [property, isOpen]);

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          property_history: formData.property_history.trim() || null,
          description: formData.description.trim() || null,
        })
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "About section updated successfully.",
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit About Section">
      <div className="space-y-6">
        <BottomSheetField label="Section Heading">
          <Input
            value={formData.property_history}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, property_history: e.target.value }))
            }
            placeholder="e.g., A Heritage of Hospitality"
            className="text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to use property name as heading
          </p>
        </BottomSheetField>

        <BottomSheetField label="Description">
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Tell your story..."
            rows={8}
            className="text-base resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use double line breaks to create paragraphs
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
