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
import { Loader2 } from "lucide-react";
import { ImagePicker } from "../ImagePicker";

interface HostEditorProps {
  isOpen: boolean;
  onClose: () => void;
  host: {
    id: string;
    name: string;
    title?: string;
    bio?: string;
    writeup?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    response_time?: string;
    languages?: string[];
  } | null;
}

export function HostEditor({ isOpen, onClose, host }: HostEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    whatsapp: "",
    response_time: "",
    languages: "",
  });
  const [hostImage, setHostImage] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Get current host image
  const getCurrentHostImage = () => {
    if (!property || !host) return null;
    return property.media?.find(
      (m: any) => m.media_type === "host_image" && m.host_id === host.id
    )?.s3_url;
  };

  // Initialize form data when host loads or editor opens
  useEffect(() => {
    if (host && isOpen) {
      setFormData({
        name: host.name || "",
        title: host.title || "",
        bio: host.bio || host.writeup || "",
        email: host.email || "",
        phone: host.phone || "",
        whatsapp: host.whatsapp || "",
        response_time: host.response_time || "",
        languages: host.languages?.join(", ") || "",
      });
      setHostImage(getCurrentHostImage() || null);
    }
  }, [host, isOpen, property]);

  const handleImageSelect = (mediaId: string, url: string) => {
    setSelectedMediaId(mediaId);
    setHostImage(url);
  };

  const handleSave = async () => {
    if (!host) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Parse languages from comma-separated string
      const languagesArray = formData.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang.length > 0);

      const { error } = await supabase
        .from("hosts")
        .update({
          name: formData.name.trim(),
          title: formData.title.trim() || null,
          bio: formData.bio.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          whatsapp: formData.whatsapp.trim() || null,
          response_time: formData.response_time.trim() || null,
          languages: languagesArray.length > 0 ? languagesArray : null,
        })
        .eq("id", host.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Host profile updated successfully.",
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

  if (!host) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Edit ${host.name}`}>
      <div className="space-y-5">
        <BottomSheetField label="Profile Photo">
          <ImagePicker
            currentImage={hostImage}
            onImageSelect={handleImageSelect}
            mediaType="host_image"
            hostId={host.id}
            aspectRatio="square"
          />
        </BottomSheetField>

        <div className="grid grid-cols-2 gap-4">
          <BottomSheetField label="Name">
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Host name"
              className="text-base"
            />
          </BottomSheetField>

          <BottomSheetField label="Title">
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Property Owner"
              className="text-base"
            />
          </BottomSheetField>
        </div>

        <BottomSheetField label="Bio">
          <Textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            placeholder="Tell guests about yourself..."
            rows={4}
            className="text-base resize-none"
          />
        </BottomSheetField>

        <div className="grid grid-cols-2 gap-4">
          <BottomSheetField label="Email">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="email@example.com"
              className="text-base"
            />
          </BottomSheetField>

          <BottomSheetField label="Phone">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <BottomSheetField label="WhatsApp">
            <Input
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
              }
              placeholder="+91 98765 43210"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include country code
            </p>
          </BottomSheetField>

          <BottomSheetField label="Response Time">
            <Input
              value={formData.response_time}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  response_time: e.target.value,
                }))
              }
              placeholder="Within 1 hour"
              className="text-base"
            />
          </BottomSheetField>
        </div>

        <BottomSheetField label="Languages">
          <Input
            value={formData.languages}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, languages: e.target.value }))
            }
            placeholder="English, Hindi, Malayalam"
            className="text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate with commas
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
