"use client";

import { useState, useMemo, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export function MediaUpload({
  propertyId,
  tenantId,
  rooms,
  hosts,
  createMediaRecord,
}: {
  propertyId: string;
  tenantId: string;
  rooms: Array<{ id: string; name: string }>;
  hosts: Array<{ id: string; name: string }>;
  createMediaRecord: (formData: FormData) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [mediaType, setMediaType] = useState("other");
  const [roomId, setRoomId] = useState("");
  const [hostId, setHostId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [uploadMode, setUploadMode] = useState<"files" | "folder">("files");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Reset the other input when switching modes
    if (uploadMode === "files" && folderInputRef.current) {
      folderInputRef.current.value = '';
    } else if (uploadMode === "folder" && fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate room selection for room images
    if (mediaType === "room_image" && !roomId) {
      alert("Please select a room for room images");
      return;
    }

    // Validate host selection for host images
    if (mediaType === "host_image" && !hostId) {
      alert("Please select a host for host images");
      return;
    }

    setUploading(true);
    let fileArray = Array.from(files);
    
    // Filter to only image files when uploading from folder
    if (uploadMode === "folder") {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
      const originalCount = fileArray.length;
      fileArray = fileArray.filter(file => {
        // Check MIME type first
        if (file.type && imageTypes.includes(file.type.toLowerCase())) {
          return true;
        }
        // Fallback: check file extension if MIME type is not available
        const ext = file.name.split('.').pop()?.toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'];
        return ext && imageExtensions.includes(ext);
      });
      
      const filteredCount = originalCount - fileArray.length;
      if (filteredCount > 0) {
        console.log(`Filtered out ${filteredCount} non-image file(s) from folder upload`);
      }
      
      if (fileArray.length === 0) {
        alert("No image files found in the selected folder. Please select a folder containing image files.");
        setUploading(false);
        return;
      }
    }
    
    const totalFiles = fileArray.length;
    let completed = 0;
    let currentOrder = displayOrder;

    try {
      // Upload all files
      for (const file of fileArray) {
        // For folder uploads, get relative path for display and folder structure
        const relativePath = uploadMode === "folder" && (file as any).webkitRelativePath
          ? (file as any).webkitRelativePath
          : null;
        const displayName = relativePath || file.name;
        
        // Extract just the filename (last part of path)
        const baseFileName = relativePath 
          ? relativePath.split(/[/\\]/).pop() || file.name
          : file.name;
        
        // For folder uploads, preserve folder structure in filename (sanitized)
        const folderPrefix = relativePath
          ? relativePath.split(/[/\\]/).slice(0, -1).join("_") + "_"
          : "";
        
        const fileExt = baseFileName.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${folderPrefix}${baseFileName}`;
        const filePath = `tenant/${tenantId}/property/${propertyId}/${fileName}`;

        setUploadProgress((prev) => ({ ...prev, [displayName]: 0 }));

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for ${displayName}:`, uploadError);
          console.error("Upload error details:", {
            message: uploadError.message,
          });
          setUploadProgress((prev) => ({ ...prev, [displayName]: -1 }));
          continue;
        }

        if (!uploadData) {
          console.error(`Upload failed for ${displayName}: No data returned`);
          setUploadProgress((prev) => ({ ...prev, [displayName]: -1 }));
          continue;
        }

        // Get public URL using the path returned from upload
        const actualPath = uploadData.path;
        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(actualPath);

        // Create media record via Server Action
        // Use the actual path returned from upload, not the original filePath
        const formData = new FormData();
        formData.append("property_id", propertyId);
        formData.append("tenant_id", tenantId);
        formData.append("media_type", mediaType);
        if (mediaType === "room_image" && roomId) {
          formData.append("room_id", roomId);
        }
        if (mediaType === "host_image" && hostId) {
          formData.append("host_id", hostId);
        }
        formData.append("display_order", String(currentOrder));
        // Increment order for next file (if uploading multiple)
        currentOrder++;
        formData.append("s3_url", publicUrl);
        formData.append("s3_key", actualPath); // Use actual path from upload
        // Use display name (with folder path if applicable) for alt text
        formData.append("alt_text", displayName);
        formData.append("is_active", "true");

        try {
          await createMediaRecord(formData);
          setUploadProgress((prev) => ({ ...prev, [displayName]: 100 }));
          completed++;
        } catch (error) {
          console.error(`DB error for ${displayName}:`, error);
          setUploadProgress((prev) => ({ ...prev, [displayName]: -1 }));
        }
      }

      if (completed > 0) {
        // Clear file inputs
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (folderInputRef.current) {
          folderInputRef.current.value = '';
        }
        
        // Refresh and wait for page to update
        setRefreshing(true);
        router.refresh();
        
        // Wait for router refresh to complete (Next.js router.refresh() is async)
        // Give it time for the server component to re-render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Hide the full-page overlay - individual thumbnails will show their own spinners
        setRefreshing(false);
      }

      if (completed < totalFiles) {
        const failedCount = totalFiles - completed;
        alert(
          `Uploaded ${completed} of ${totalFiles} image files. ${failedCount} file(s) failed to upload.`
        );
      } else if (uploadMode === "folder" && totalFiles > 0) {
        // Show success message for folder uploads
        console.log(`Successfully uploaded ${completed} image file(s) from folder`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + (error as Error).message);
      setRefreshing(false);
    } finally {
      setUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress({}), 3000);
    }
  }

  return (
    <>
      {(uploading || refreshing) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="text-sm font-medium">
              {uploading ? "Uploading images..." : "Loading thumbnails..."}
            </p>
            {uploading && Object.keys(uploadProgress).length > 0 && (
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="text-xs text-zinc-600">
                    {fileName}: {progress === 100 ? "✓ Complete" : progress === -1 ? "✗ Failed" : "Uploading..."}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium mb-2">Image Type</div>
            <select
              value={mediaType}
              onChange={(e) => {
                setMediaType(e.target.value);
                if (e.target.value !== "room_image") {
                  setRoomId("");
                }
                if (e.target.value !== "host_image") {
                  setHostId("");
                }
              }}
              className="w-full rounded-md border px-3 py-2"
              disabled={uploading || refreshing}
            >
              <option value="hero">Hero</option>
              <option value="room_image">Room Image</option>
              <option value="host_image">Host Image</option>
              <option value="exterior">Exterior</option>
              <option value="common_area">Common Area</option>
              <option value="gallery">Gallery</option>
              <option value="other">Other</option>
            </select>
          </label>
          {mediaType === "room_image" && (
            <label className="block">
              <div className="text-sm font-medium mb-2">Room</div>
              {rooms.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No rooms created yet. Create rooms in the Rooms tab first.
                </p>
              ) : (
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                  disabled={uploading || refreshing}
                  required
                >
                  <option value="">Select room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
          )}
          {mediaType === "host_image" && (
            <label className="block">
              <div className="text-sm font-medium mb-2">Host</div>
              {hosts.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No hosts created yet. Create hosts in the Hosts tab first.
                </p>
              ) : (
                <select
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                  disabled={uploading || refreshing}
                  required
                >
                  <option value="">Select host</option>
                  {hosts.map((host) => (
                    <option key={host.id} value={host.id}>
                      {host.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
          )}
          {(mediaType === "hero" || mediaType === "common_area") && (
            <label className="block">
              <div className="text-sm font-medium mb-2">Display Order</div>
              <input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2"
                disabled={uploading || refreshing}
                placeholder="0"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Lower numbers appear first
              </p>
            </label>
          )}
        </div>
        <div className="space-y-3">
          <div className="space-y-2 border-b pb-3">
            <div className="text-sm font-medium mb-2">Upload Type</div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="files"
                  checked={uploadMode === "files"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setUploadMode("files");
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      if (folderInputRef.current) folderInputRef.current.value = '';
                    }
                  }}
                  disabled={uploading || refreshing}
                  className="w-4 h-4 text-black border-zinc-300 focus:ring-black focus:ring-2"
                />
                <span className="text-sm text-zinc-700">Upload Files</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="folder"
                  checked={uploadMode === "folder"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setUploadMode("folder");
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      if (folderInputRef.current) folderInputRef.current.value = '';
                    }
                  }}
                  disabled={uploading || refreshing}
                  className="w-4 h-4 text-black border-zinc-300 focus:ring-black focus:ring-2"
                />
                <span className="text-sm text-zinc-700">Upload Folder</span>
              </label>
            </div>
          </div>
          
          {uploadMode === "files" ? (
            <label className="block">
              <div className="text-sm font-medium mb-2">Select Images</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading || refreshing || (mediaType === "room_image" && !roomId)}
                className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-white file:cursor-pointer hover:file:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-zinc-500">
                {mediaType === "room_image" && !roomId
                  ? "Please select a room first"
                  : mediaType === "host_image" && !hostId
                  ? "Please select a host first"
                  : "You can select multiple images at once"}
              </p>
            </label>
          ) : (
            <div className="block">
              <div className="text-sm font-medium mb-2">Select Folder</div>
              <div className="relative inline-block">
                <input
                  ref={folderInputRef}
                  type="file"
                  accept="image/*"
                  // @ts-ignore - webkitdirectory is a valid HTML attribute
                  webkitdirectory=""
                  directory=""
                  onChange={handleUpload}
                  disabled={uploading || refreshing || (mediaType === "room_image" && !roomId)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  id="folder-upload-input"
                />
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={uploading || refreshing || (mediaType === "room_image" && !roomId)}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                    uploading || refreshing || (mediaType === "room_image" && !roomId)
                      ? "bg-zinc-400 cursor-not-allowed"
                      : "bg-black hover:bg-zinc-800 cursor-pointer"
                  }`}
                >
                  Choose Folder
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {mediaType === "room_image" && !roomId
                  ? "Please select a room first"
                  : mediaType === "host_image" && !hostId
                  ? "Please select a host first"
                  : "Select one folder to upload all image files within it (including subfolders). Non-image files will be automatically filtered out."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
