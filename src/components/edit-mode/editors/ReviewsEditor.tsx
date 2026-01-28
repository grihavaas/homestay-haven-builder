"use client";

import { useState, useEffect } from "react";
import {
  BottomSheet,
  BottomSheetField,
  BottomSheetActions,
} from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Star } from "lucide-react";

interface ReviewsEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReviewSource {
  id?: string;
  site_name: string;
  stars: number | null;
  total_reviews: number;
  review_url: string;
  display_order: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

const COMMON_SITES = ["Google", "Booking.com", "TripAdvisor", "Airbnb", "MakeMyTrip", "Goibibo"];

export function ReviewsEditor({ isOpen, onClose }: ReviewsEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [sources, setSources] = useState<ReviewSource[]>([]);

  // Initialize sources when property loads or editor opens
  useEffect(() => {
    if (property && isOpen) {
      const reviewSources = property.review_sources
        ?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        ?.map((r: any) => ({
          id: r.id,
          site_name: r.site_name || "",
          stars: r.stars ?? null,
          total_reviews: r.total_reviews || 0,
          review_url: r.review_url || "",
          display_order: r.display_order || 0,
        })) || [];

      setSources(reviewSources.length > 0 ? reviewSources : [createEmptySource(0)]);
    }
  }, [property, isOpen]);

  const createEmptySource = (order: number): ReviewSource => ({
    site_name: "",
    stars: null,
    total_reviews: 0,
    review_url: "",
    display_order: order,
    isNew: true,
  });

  const addSource = () => {
    const maxOrder = Math.max(...sources.map((s) => s.display_order), -1);
    setSources([...sources, createEmptySource(maxOrder + 1)]);
  };

  const removeSource = (index: number) => {
    const source = sources[index];
    if (source.id) {
      // Mark existing source as deleted
      setSources(sources.map((s, i) => (i === index ? { ...s, isDeleted: true } : s)));
    } else {
      // Remove new source entirely
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const updateSource = (index: number, updates: Partial<ReviewSource>) => {
    setSources(sources.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Delete marked sources
      const toDelete = sources.filter((s) => s.isDeleted && s.id);
      for (const source of toDelete) {
        const { error } = await supabase
          .from("review_sources")
          .delete()
          .eq("id", source.id);
        if (error) throw error;
      }

      // Update existing sources
      const toUpdate = sources.filter((s) => !s.isNew && !s.isDeleted && s.id && s.site_name.trim());
      for (const source of toUpdate) {
        const { error } = await supabase
          .from("review_sources")
          .update({
            site_name: source.site_name.trim(),
            stars: source.stars,
            total_reviews: source.total_reviews,
            review_url: source.review_url.trim() || null,
            display_order: source.display_order,
          })
          .eq("id", source.id);
        if (error) throw error;
      }

      // Insert new sources
      const toInsert = sources.filter((s) => s.isNew && !s.isDeleted && s.site_name.trim());
      if (toInsert.length > 0) {
        const { error } = await supabase.from("review_sources").insert(
          toInsert.map((s) => ({
            property_id: property.id,
            tenant_id: property.tenant_id,
            site_name: s.site_name.trim(),
            stars: s.stars,
            total_reviews: s.total_reviews,
            review_url: s.review_url.trim() || null,
            display_order: s.display_order,
          }))
        );
        if (error) throw error;
      }

      toast({
        title: "Saved",
        description: "Review sources updated successfully.",
      });

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

  const visibleSources = sources.filter((s) => !s.isDeleted);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Review Sources">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add your ratings from different review platforms to showcase your reputation.
        </p>

        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
          {visibleSources.map((source, index) => {
            const actualIndex = sources.findIndex((s) => s === source);
            return (
              <div key={source.id || `new-${index}`} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Review Source {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSource(actualIndex)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Site Name */}
                <BottomSheetField label="Platform Name">
                  <Input
                    value={source.site_name}
                    onChange={(e) => updateSource(actualIndex, { site_name: e.target.value })}
                    placeholder="e.g., Google, Booking.com"
                    className="text-base"
                    list={`sites-${index}`}
                  />
                  <datalist id={`sites-${index}`}>
                    {COMMON_SITES.map((site) => (
                      <option key={site} value={site} />
                    ))}
                  </datalist>
                </BottomSheetField>

                {/* Rating */}
                <BottomSheetField label="Rating (out of 5)">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={source.stars ?? ""}
                      onChange={(e) => updateSource(actualIndex, {
                        stars: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      placeholder="4.5"
                      className="text-base w-24"
                    />
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            source.stars && star <= Math.floor(source.stars)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </BottomSheetField>

                {/* Total Reviews */}
                <BottomSheetField label="Number of Reviews">
                  <Input
                    type="number"
                    min="0"
                    value={source.total_reviews || ""}
                    onChange={(e) => updateSource(actualIndex, {
                      total_reviews: parseInt(e.target.value) || 0
                    })}
                    placeholder="150"
                    className="text-base w-32"
                  />
                </BottomSheetField>

                {/* Review URL */}
                <BottomSheetField label="Link to Reviews (optional)">
                  <Input
                    type="url"
                    value={source.review_url}
                    onChange={(e) => updateSource(actualIndex, { review_url: e.target.value })}
                    placeholder="https://..."
                    className="text-base"
                  />
                </BottomSheetField>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addSource}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Review Source
        </Button>

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
