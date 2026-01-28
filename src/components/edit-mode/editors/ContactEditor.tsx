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
import { Loader2 } from "lucide-react";

interface ContactEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactEditor({ isOpen, onClose }: ContactEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    whatsapp: "",
    check_in_time: "",
    check_out_time: "",
  });

  // Initialize form data when property loads or editor opens
  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        phone: property.phone || "",
        email: property.email || "",
        whatsapp: property.hosts?.[0]?.whatsapp || "",
        check_in_time: property.booking_settings?.check_in_time || "",
        check_out_time: property.booking_settings?.check_out_time || "",
      });
    }
  }, [property, isOpen]);

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Update property contact info
      const { error: propertyError } = await supabase
        .from("properties")
        .update({
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
        })
        .eq("id", property.id);

      if (propertyError) throw propertyError;

      // Update host WhatsApp if there's a host
      if (property.hosts?.[0]?.id && formData.whatsapp) {
        const { error: hostError } = await supabase
          .from("hosts")
          .update({
            whatsapp: formData.whatsapp.trim() || null,
          })
          .eq("id", property.hosts[0].id);

        if (hostError) throw hostError;
      }

      // Update booking settings if they exist
      if (property.booking_settings?.id) {
        const { error: bookingError } = await supabase
          .from("booking_settings")
          .update({
            check_in_time: formData.check_in_time.trim() || null,
            check_out_time: formData.check_out_time.trim() || null,
          })
          .eq("id", property.booking_settings.id);

        if (bookingError) throw bookingError;
      }

      toast({
        title: "Saved",
        description: "Contact information updated successfully.",
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Contact & Booking">
      <div className="space-y-5">
        <BottomSheetField label="Phone Number">
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+91 98765 43210"
            className="text-base"
          />
        </BottomSheetField>

        <BottomSheetField label="Email Address">
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="contact@property.com"
            className="text-base"
          />
        </BottomSheetField>

        <BottomSheetField label="WhatsApp Number">
          <Input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
            }
            placeholder="+91 98765 43210"
            className="text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used for inquiry form and contact buttons
          </p>
        </BottomSheetField>

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
