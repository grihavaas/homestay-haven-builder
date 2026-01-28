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
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { ImagePicker } from "../ImagePicker";
import { cn } from "@/lib/utils";

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
    room_amenities?: Array<{ id: string; name: string; category?: string }>;
  } | null;
}

interface StandardAmenity {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

export function RoomEditor({ isOpen, onClose, room }: RoomEditorProps) {
  const { property } = useProperty();
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
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Collapsible sections
  const [showDescription, setShowDescription] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);

  // Amenities
  const [availableAmenities, setAvailableAmenities] = useState<StandardAmenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  // Get current room image
  const getCurrentRoomImage = () => {
    if (!property || !room) return null;
    return property.media?.find(
      (m: any) => m.media_type === "room_image" && m.room_id === room.id
    )?.s3_url;
  };

  // Fetch room-scope amenities when amenities section is opened
  useEffect(() => {
    if (showAmenities && availableAmenities.length === 0 && !loadingAmenities) {
      fetchRoomAmenities();
    }
  }, [showAmenities]);

  const fetchRoomAmenities = async () => {
    setLoadingAmenities(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("standard_amenities")
        .select("id, name, category, icon")
        .in("amenity_scope", ["room", "both"])
        .order("category")
        .order("name");

      if (error) throw error;
      setAvailableAmenities(data || []);
    } catch (error) {
      console.error("Error fetching amenities:", error);
    } finally {
      setLoadingAmenities(false);
    }
  };

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
      setRoomImage(getCurrentRoomImage() || null);

      // Initialize selected amenities
      const currentAmenityIds = new Set(
        room.room_amenities?.map((a) => a.id) || []
      );
      setSelectedAmenityIds(currentAmenityIds);

      // Auto-expand description if it has content
      setShowDescription(!!(room.description || room.room_features));
    }
  }, [room, isOpen, property]);

  const handleImageSelect = (mediaId: string, url: string) => {
    setSelectedMediaId(mediaId);
    setRoomImage(url);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenityIds((prev) => {
      const next = new Set(prev);
      if (next.has(amenityId)) {
        next.delete(amenityId);
      } else {
        next.add(amenityId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!room) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Update room details
      const { error: roomError } = await supabase
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

      if (roomError) throw roomError;

      // Update room amenities (delete all, then insert selected)
      const { error: deleteError } = await supabase
        .from("room_amenities")
        .delete()
        .eq("room_id", room.id);

      if (deleteError) throw deleteError;

      if (selectedAmenityIds.size > 0) {
        const amenityInserts = Array.from(selectedAmenityIds).map((amenityId) => ({
          room_id: room.id,
          amenity_id: amenityId,
        }));

        const { error: insertError } = await supabase
          .from("room_amenities")
          .insert(amenityInserts);

        if (insertError) throw insertError;
      }

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

  // Group amenities by category
  const groupedAmenities = availableAmenities.reduce((acc, amenity) => {
    const category = amenity.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, StandardAmenity[]>);

  if (!room) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Edit ${room.name}`}>
      <div className="space-y-5">
        {/* Pricing - Most Dynamic, at Top */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <h4 className="text-sm font-medium text-primary mb-3">Pricing & Capacity</h4>
          <div className="grid grid-cols-2 gap-4">
            <BottomSheetField label="Base Rate (₹/night)">
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
        </div>

        {/* Room Image */}
        <BottomSheetField label="Room Image">
          <ImagePicker
            currentImage={roomImage}
            onImageSelect={handleImageSelect}
            mediaType="room_image"
            roomId={room.id}
            aspectRatio="video"
          />
        </BottomSheetField>

        {/* Room Name */}
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

        {/* Quick Stats */}
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

        {/* Collapsible Description Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDescription(!showDescription)}
            className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">Description & Features</span>
            {showDescription ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {showDescription && (
            <div className="p-3 space-y-4 border-t">
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
            </div>
          )}
        </div>

        {/* Collapsible Amenities Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAmenities(!showAmenities)}
            className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Room Amenities</span>
              {selectedAmenityIds.size > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {selectedAmenityIds.size} selected
                </span>
              )}
            </div>
            {showAmenities ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {showAmenities && (
            <div className="p-3 border-t max-h-64 overflow-y-auto">
              {loadingAmenities ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedAmenities).map(([category, amenities]) => (
                    <div key={category}>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        {category}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity) => {
                          const isSelected = selectedAmenityIds.has(amenity.id);
                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => toggleAmenity(amenity.id)}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80 text-foreground"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              {amenity.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
