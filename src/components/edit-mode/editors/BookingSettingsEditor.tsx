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
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface BookingSettingsEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingSettingsEditor({ isOpen, onClose }: BookingSettingsEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [formData, setFormData] = useState({
    check_in_time: "",
    check_out_time: "",
    min_stay_nights: "",
    cancellation_full_refund_policy: "",
    cancellation_full_refund_hours: "",
    cancellation_partial_refund_policy: "",
    cancellation_partial_refund_hours: "",
    cancellation_no_refund_policy: "",
  });

  // Initialize form data when property loads or editor opens
  useEffect(() => {
    if (property && isOpen) {
      const bs = property.booking_settings;
      setFormData({
        check_in_time: bs?.check_in_time || "",
        check_out_time: bs?.check_out_time || "",
        min_stay_nights: bs?.min_stay_nights?.toString() || "",
        cancellation_full_refund_policy: bs?.cancellation_full_refund_policy || "",
        cancellation_full_refund_hours: bs?.cancellation_full_refund_hours?.toString() || "",
        cancellation_partial_refund_policy: bs?.cancellation_partial_refund_policy || "",
        cancellation_partial_refund_hours: bs?.cancellation_partial_refund_hours?.toString() || "",
        cancellation_no_refund_policy: bs?.cancellation_no_refund_policy || "",
      });

      // Auto-expand cancellation if any policy exists
      if (bs?.cancellation_full_refund_policy ||
          bs?.cancellation_partial_refund_policy ||
          bs?.cancellation_no_refund_policy) {
        setShowCancellation(true);
      }
    }
  }, [property, isOpen]);

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const updateData = {
        check_in_time: formData.check_in_time.trim() || null,
        check_out_time: formData.check_out_time.trim() || null,
        min_stay_nights: formData.min_stay_nights ? parseInt(formData.min_stay_nights) : null,
        cancellation_full_refund_policy: formData.cancellation_full_refund_policy.trim() || null,
        cancellation_full_refund_hours: formData.cancellation_full_refund_hours
          ? parseInt(formData.cancellation_full_refund_hours)
          : null,
        cancellation_partial_refund_policy: formData.cancellation_partial_refund_policy.trim() || null,
        cancellation_partial_refund_hours: formData.cancellation_partial_refund_hours
          ? parseInt(formData.cancellation_partial_refund_hours)
          : null,
        cancellation_no_refund_policy: formData.cancellation_no_refund_policy.trim() || null,
      };

      if (property.booking_settings?.id) {
        // Update existing booking settings
        const { error } = await supabase
          .from("booking_settings")
          .update(updateData)
          .eq("id", property.booking_settings.id);

        if (error) throw error;
      } else {
        // Create new booking settings
        const { error } = await supabase
          .from("booking_settings")
          .insert({
            ...updateData,
            property_id: property.id,
          });

        if (error) throw error;
      }

      toast({
        title: "Saved",
        description: "Booking settings updated successfully.",
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Booking Settings">
      <div className="space-y-5">
        {/* Check-in/Check-out Times */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <h4 className="text-sm font-medium text-primary mb-3">Check-in & Check-out</h4>
          <div className="grid grid-cols-2 gap-4">
            <BottomSheetField label="Check-in Time">
              <Input
                value={formData.check_in_time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, check_in_time: e.target.value }))
                }
                placeholder="2:00 PM"
                className="text-base"
              />
            </BottomSheetField>

            <BottomSheetField label="Check-out Time">
              <Input
                value={formData.check_out_time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, check_out_time: e.target.value }))
                }
                placeholder="11:00 AM"
                className="text-base"
              />
            </BottomSheetField>
          </div>

          <div className="mt-4">
            <BottomSheetField label="Minimum Stay (nights)">
              <Input
                type="number"
                value={formData.min_stay_nights}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, min_stay_nights: e.target.value }))
                }
                placeholder="1"
                className="text-base"
                min="1"
              />
            </BottomSheetField>
          </div>
        </div>

        {/* Collapsible Cancellation Policy Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCancellation(!showCancellation)}
            className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">Cancellation Policy</span>
            {showCancellation ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {showCancellation && (
            <div className="p-4 border-t space-y-5">
              {/* Full Refund Policy */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                    1
                  </div>
                  <span className="text-sm font-semibold text-foreground">Full Refund</span>
                </div>
                <div className="space-y-3">
                  <BottomSheetField label="Hours before check-in">
                    <Input
                      type="number"
                      value={formData.cancellation_full_refund_hours}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cancellation_full_refund_hours: e.target.value
                        }))
                      }
                      placeholder="48"
                      className="text-base"
                      min="0"
                    />
                  </BottomSheetField>
                  <BottomSheetField label="Policy description">
                    <Textarea
                      value={formData.cancellation_full_refund_policy}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cancellation_full_refund_policy: e.target.value
                        }))
                      }
                      placeholder="Full refund if cancelled 48+ hours before check-in"
                      rows={2}
                      className="text-base resize-none"
                    />
                  </BottomSheetField>
                </div>
              </div>

              {/* Partial Refund Policy */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-xs font-semibold text-yellow-700">
                    2
                  </div>
                  <span className="text-sm font-semibold text-foreground">Partial Refund</span>
                </div>
                <div className="space-y-3">
                  <BottomSheetField label="Hours before check-in">
                    <Input
                      type="number"
                      value={formData.cancellation_partial_refund_hours}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cancellation_partial_refund_hours: e.target.value
                        }))
                      }
                      placeholder="24"
                      className="text-base"
                      min="0"
                    />
                  </BottomSheetField>
                  <BottomSheetField label="Policy description">
                    <Textarea
                      value={formData.cancellation_partial_refund_policy}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cancellation_partial_refund_policy: e.target.value
                        }))
                      }
                      placeholder="50% refund if cancelled 24-48 hours before check-in"
                      rows={2}
                      className="text-base resize-none"
                    />
                  </BottomSheetField>
                </div>
              </div>

              {/* No Refund Policy */}
              <div className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
                    3
                  </div>
                  <span className="text-sm font-semibold text-foreground">No Refund</span>
                </div>
                <BottomSheetField label="Policy description">
                  <Textarea
                    value={formData.cancellation_no_refund_policy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cancellation_no_refund_policy: e.target.value
                      }))
                    }
                    placeholder="No refund for cancellations less than 24 hours before check-in"
                    rows={2}
                    className="text-base resize-none"
                  />
                </BottomSheetField>
              </div>
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
