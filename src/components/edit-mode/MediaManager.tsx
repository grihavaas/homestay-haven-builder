"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useProperty } from "@/contexts/PropertyContext";
import { Button } from "@/components/ui/button";
import {
  X,
  Upload,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Home,
  Bed,
  User,
  Grid3X3,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type MediaCategory = "all" | "hero" | "room_image" | "host_image" | "gallery";

export function MediaManager({ isOpen, onClose }: MediaManagerProps) {
  const { property } = useProperty();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MediaCategory>("all");
  const [mediaType, setMediaType] = useState<string>("gallery");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedHost, setSelectedHost] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!property) return null;

  const allMedia = property.media || [];

  // Filter media by category
  const filteredMedia =
    activeCategory === "all"
      ? allMedia
      : allMedia.filter((m: any) => m.media_type === activeCategory);

  const categories: { id: MediaCategory; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All", icon: <Grid3X3 className="w-4 h-4" /> },
    { id: "hero", label: "Hero", icon: <Home className="w-4 h-4" /> },
    { id: "room_image", label: "Rooms", icon: <Bed className="w-4 h-4" /> },
    { id: "host_image", label: "Hosts", icon: <User className="w-4 h-4" /> },
    { id: "gallery", label: "Gallery", icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !property) return;

    // Validation for room/host images
    if (mediaType === "room_image" && !selectedRoom) {
      toast({
        title: "Select a room",
        description: "Please select a room for this image.",
        variant: "destructive",
      });
      return;
    }

    if (mediaType === "host_image" && !selectedHost) {
      toast({
        title: "Select a host",
        description: "Please select a host for this image.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      let successCount = 0;

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `tenant/${property.tenant_id}/property/${property.id}/${fileName}`;

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(uploadData.path);

        // Create media record
        const { error: dbError } = await supabase.from("media").insert({
          property_id: property.id,
          tenant_id: property.tenant_id,
          media_type: mediaType,
          room_id: mediaType === "room_image" ? selectedRoom : null,
          host_id: mediaType === "host_image" ? selectedHost : null,
          s3_url: publicUrl,
          s3_key: uploadData.path,
          alt_text: file.name,
          is_active: true,
          display_order: 0,
        });

        if (!dbError) {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Upload complete",
          description: `${successCount} image(s) uploaded successfully.`,
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (mediaId: string, s3Key: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeleting(mediaId);
    try {
      const supabase = createSupabaseBrowserClient();

      // Delete from storage
      if (s3Key) {
        await supabase.storage.from("media").remove([s3Key]);
      }

      // Delete from database
      const { error } = await supabase.from("media").delete().eq("id", mediaId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Image deleted successfully.",
      });
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background z-50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Media Library</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 p-4 border-b overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {cat.icon}
                  {cat.label}
                  <span className="text-xs opacity-70">
                    (
                    {cat.id === "all"
                      ? allMedia.length
                      : allMedia.filter((m: any) => m.media_type === cat.id).length}
                    )
                  </span>
                </button>
              ))}
            </div>

            {/* Upload Section */}
            <div className="p-4 border-b bg-muted/30">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Image Type
                    </label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full text-sm border rounded-md px-2 py-1.5"
                      disabled={uploading}
                    >
                      <option value="hero">Hero</option>
                      <option value="room_image">Room Image</option>
                      <option value="host_image">Host Image</option>
                      <option value="gallery">Gallery</option>
                      <option value="exterior">Exterior</option>
                      <option value="common_area">Common Area</option>
                    </select>
                  </div>

                  {mediaType === "room_image" && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Room
                      </label>
                      <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="w-full text-sm border rounded-md px-2 py-1.5"
                        disabled={uploading}
                      >
                        <option value="">Select room...</option>
                        {property.rooms?.map((room: any) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {mediaType === "host_image" && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Host
                      </label>
                      <select
                        value={selectedHost}
                        onChange={(e) => setSelectedHost(e.target.value)}
                        className="w-full text-sm border rounded-md px-2 py-1.5"
                        disabled={uploading}
                      >
                        <option value="">Select host...</option>
                        {property.hosts?.map((host: any) => (
                          <option key={host.id} value={host.id}>
                            {host.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
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
                      Upload Images
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">No images in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredMedia.map((media: any) => (
                    <div
                      key={media.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                    >
                      <img
                        src={media.s3_url}
                        alt={media.alt_text || "Media"}
                        className="w-full h-full object-cover"
                      />

                      {/* Type badge */}
                      <div className="absolute top-1 left-1">
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-black/60 text-white rounded">
                          {media.media_type === "room_image"
                            ? "Room"
                            : media.media_type === "host_image"
                            ? "Host"
                            : media.media_type}
                        </span>
                      </div>

                      {/* Delete button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(media.id, media.s3_key)}
                          disabled={deleting === media.id}
                        >
                          {deleting === media.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
