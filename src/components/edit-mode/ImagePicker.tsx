"use client";

import { useState } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { Button } from "@/components/ui/button";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  currentImage?: string | null;
  onImageSelect: (mediaId: string, url: string) => void;
  mediaType: "hero" | "room_image" | "host_image" | "gallery";
  roomId?: string;
  hostId?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait";
}

export function ImagePicker({
  currentImage,
  onImageSelect,
  mediaType,
  roomId,
  hostId,
  className,
  aspectRatio = "video",
}: ImagePickerProps) {
  const { property } = useProperty();
  const [showLibrary, setShowLibrary] = useState(false);

  if (!property) return null;

  // Filter media by category
  const getFilteredMedia = () => {
    const allMedia = property.media || [];

    switch (mediaType) {
      case "hero":
        // Show hero and gallery images for hero selection
        return allMedia.filter((m: any) =>
          m.media_type === "hero" || m.media_type === "gallery"
        );
      case "room_image":
        // Show room images (optionally filter by specific room or show all room images)
        return allMedia.filter((m: any) => m.media_type === "room_image");
      case "host_image":
        // Show host images
        return allMedia.filter((m: any) => m.media_type === "host_image");
      case "gallery":
        return allMedia.filter((m: any) => m.media_type === "gallery");
      default:
        return allMedia;
    }
  };

  const filteredMedia = getFilteredMedia();

  const handleSelectImage = (media: any) => {
    onImageSelect(media.id, media.s3_url);
    setShowLibrary(false);
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  const getCategoryLabel = () => {
    switch (mediaType) {
      case "hero": return "Hero & Gallery";
      case "room_image": return "Room";
      case "host_image": return "Host";
      case "gallery": return "Gallery";
      default: return "Media";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Current Image Preview */}
      <div
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 overflow-hidden cursor-pointer group",
          aspectRatioClass
        )}
        onClick={() => setShowLibrary(true)}
      >
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt="Current"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button type="button" variant="secondary" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Change
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Click to select image</p>
          </div>
        )}
      </div>

      {/* Hint text */}
      <p className="text-xs text-muted-foreground">
        Select from {getCategoryLabel()} images in your media library
      </p>

      {/* Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLibrary(false)}
          />

          {/* Modal */}
          <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">Select Image</h3>
                <p className="text-xs text-muted-foreground">
                  Showing {getCategoryLabel()} images ({filteredMedia.length})
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLibrary(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm text-center">
                    No {getCategoryLabel().toLowerCase()} images available.
                  </p>
                  <p className="text-xs text-center mt-1">
                    Upload images using the Media button in edit mode.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredMedia.map((media: any) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => handleSelectImage(media)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50",
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
                      {currentImage === media.s3_url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Need to upload new images? Use the <strong>Media</strong> button to manage your library.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
