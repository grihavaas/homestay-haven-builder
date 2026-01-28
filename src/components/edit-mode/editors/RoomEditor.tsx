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
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RoomEditorProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string;
    name: string;
    description?: string;
    base_rate?: number;
    max_guests?: number;
    room_size_sqft?: number;
    view_type?: string;
    room_features?: string;
  } | null;
}

export function RoomEditor({ isOpen, onClose, room }: RoomEditorProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_rate: "",
    max_guests: "",
    room_size_sqft: "",
    view_type: "",
    room_features: "",
  });

  // Initialize form data when room loads or editor opens
  useEffect(() => {
    if (room && isOpen) {
      setFormData({
        name: room.name || "",
        description: room.description || "",
        base_rate: room.base_rate?.toString() || "",
        max_guests: room.max_guests?.toString() || "",
        room_size_sqft: room.room_size_sqft?.toString() || "",
        view_type: room.view_type || "",
        room_features: room.room_features || "",
      });
    }
  }, [room, isOpen]);

  const handleSave = async () => {
    if (!room) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          base_rate: formData.base_rate ? parseFloat(formData.base_rate) : null,
          max_guests: formData.max_guests
            ? parseInt(formData.max_guests)
            : null,
          room_size_sqft: formData.room_size_sqft
            ? parseInt(formData.room_size_sqft)
            : null,
          view_type: formData.view_type.trim() || null,
          room_features: formData.room_features.trim() || null,
        })
        .eq("id", room.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Room updated successfully.",
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

  if (!room) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Edit ${room.name}`}>
      <div className="space-y-5">
        <BottomSheetField label="Room Name">
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Deluxe River View"
            className="text-base"
          />
        </BottomSheetField>

        <BottomSheetField label="Description">
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe the room..."
            rows={3}
            className="text-base resize-none"
          />
        </BottomSheetField>

        <div className="grid grid-cols-2 gap-4">
          <BottomSheetField label="Base Rate (per night)">
            <Input
              type="number"
              value={formData.base_rate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, base_rate: e.target.value }))
              }
              placeholder="5000"
              className="text-base"
            />
          </BottomSheetField>

          <BottomSheetField label="Max Guests">
            <Input
              type="number"
              value={formData.max_guests}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, max_guests: e.target.value }))
              }
              placeholder="4"
              className="text-base"
            />
          </BottomSheetField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <BottomSheetField label="Room Size (sq ft)">
            <Input
              type="number"
              value={formData.room_size_sqft}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  room_size_sqft: e.target.value,
                }))
              }
              placeholder="450"
              className="text-base"
            />
          </BottomSheetField>

          <BottomSheetField label="View Type">
            <Input
              value={formData.view_type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, view_type: e.target.value }))
              }
              placeholder="River View"
              className="text-base"
            />
          </BottomSheetField>
        </div>

        <BottomSheetField label="Room Features / USP">
          <Textarea
            value={formData.room_features}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                room_features: e.target.value,
              }))
            }
            placeholder="Unique selling points..."
            rows={2}
            className="text-base resize-none"
          />
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
