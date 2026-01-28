"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useProperty } from "@/contexts/PropertyContext";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  currentImage?: string | null;
  onImageChange: (url: string, s3Key: string) => void;
  mediaType: "hero" | "room_image" | "host_image" | "gallery" | "other";
  roomId?: string;
  hostId?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait";
  showLibrary?: boolean;
}

export function ImagePicker({
  currentImage,
  onImageChange,
  mediaType,
  roomId,
  hostId,
  className,
  aspectRatio = "video",
  showLibrary = true,
}: ImagePickerProps) {
  const { property } = useProperty();
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get existing media of the same type for the library
  const existingMedia = property?.media?.filter((m: any) => {
    if (mediaType === "hero") {
      return m.media_type === "hero" || m.media_type === "gallery";
    }
    if (mediaType === "room_image") {
      return m.media_type === "room_image" || m.media_type === "gallery";
    }
    if (mediaType === "host_image") {
      return m.media_type === "host_image";
    }
    return m.media_type === mediaType;
  }) || [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !property) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `tenant/${property.tenant_id}/property/${property.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(uploadData.path);

      // Create media record
      const { error: dbError } = await supabase.from("media").insert({
        property_id: property.id,
        tenant_id: property.tenant_id,
        media_type: mediaType,
        room_id: roomId || null,
        host_id: hostId || null,
        s3_url: publicUrl,
        s3_key: uploadData.path,
        alt_text: file.name,
        is_active: true,
        display_order: 0,
      });

      if (dbError) throw dbError;

      onImageChange(publicUrl, uploadData.path);
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectFromLibrary = (media: any) => {
    onImageChange(media.s3_url, media.s3_key);
    setShowGallery(false);
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Current Image Preview */}
      <div
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 overflow-hidden",
          aspectRatioClass
        )}
      >
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt="Current"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Change
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No image selected</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </>
          )}
        </Button>
        {showLibrary && existingMedia.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowGallery(!showGallery)}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            From Library
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Media Library Gallery */}
      {showGallery && existingMedia.length > 0 && (
        <div className="border rounded-lg p-3 bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Select from library</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowGallery(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {existingMedia.map((media: any) => (
              <button
                key={media.id}
                type="button"
                onClick={() => handleSelectFromLibrary(media)}
                className={cn(
                  "relative aspect-square rounded overflow-hidden border-2 transition-all hover:border-primary",
                  currentImage === media.s3_url
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent"
                )}
              >
                <img
                  src={media.s3_url}
                  alt={media.alt_text || "Media"}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
