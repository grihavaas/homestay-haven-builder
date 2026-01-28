"use client";

import { useState, useEffect } from "react";
import {
  BottomSheet,
  BottomSheetActions,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useProperty } from "@/contexts/PropertyContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AmenitiesEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StandardAmenity {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

export function AmenitiesEditor({ isOpen, onClose }: AmenitiesEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Amenities
  const [availableAmenities, setAvailableAmenities] = useState<StandardAmenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());

  // Fetch property-scope amenities when editor opens
  useEffect(() => {
    if (isOpen && availableAmenities.length === 0) {
      fetchPropertyAmenities();
    }
  }, [isOpen]);

  // Initialize selected amenities from property
  useEffect(() => {
    if (property && isOpen) {
      const currentAmenityIds = new Set<string>(
        property.amenities?.map((a: any) => a.id as string) || []
      );
      setSelectedAmenityIds(currentAmenityIds);
    }
  }, [property, isOpen]);

  const fetchPropertyAmenities = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("standard_amenities")
        .select("id, name, category, icon")
        .in("amenity_scope", ["property", "both"])
        .order("category")
        .order("name");

      if (error) throw error;
      setAvailableAmenities(data || []);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast({
        title: "Error",
        description: "Failed to load amenities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    if (!property) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Delete all existing property amenities
      const { error: deleteError } = await supabase
        .from("property_amenities")
        .delete()
        .eq("property_id", property.id);

      if (deleteError) throw deleteError;

      // Insert selected amenities
      if (selectedAmenityIds.size > 0) {
        const amenityInserts = Array.from(selectedAmenityIds).map((amenityId) => ({
          property_id: property.id,
          amenity_id: amenityId,
        }));

        const { error: insertError } = await supabase
          .from("property_amenities")
          .insert(amenityInserts);

        if (insertError) throw insertError;
      }

      toast({
        title: "Saved",
        description: "Property amenities updated successfully.",
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

  // Filter amenities by search query
  const filteredGroups = Object.entries(groupedAmenities).reduce(
    (acc, [category, amenities]) => {
      if (!searchQuery) {
        acc[category] = amenities;
        return acc;
      }
      const filtered = amenities.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, StandardAmenity[]>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Property Amenities">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search amenities..."
            className="pl-9"
          />
        </div>

        {/* Selection count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedAmenityIds.size} amenities selected
          </span>
          {selectedAmenityIds.size > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAmenityIds(new Set())}
              className="text-destructive hover:underline text-xs"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Amenities List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(filteredGroups).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No amenities match your search" : "No amenities available"}
            </div>
          ) : (
            Object.entries(filteredGroups).map(([category, amenities]) => (
              <div key={category}>
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 sticky top-0 bg-background py-1">
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
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {amenity.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <BottomSheetActions>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading} className="flex-1">
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
