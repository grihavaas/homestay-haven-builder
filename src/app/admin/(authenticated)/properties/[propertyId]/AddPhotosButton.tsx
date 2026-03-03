"use client";

import { useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type UploadDestination = {
  mediaType: "hero" | "room_image" | "host_image" | "gallery";
  roomId?: string | null;
  hostId?: string | null;
};

export function AddPhotosButton({
  propertyId,
  tenantId,
  destination,
  displayOrderStart,
  createMediaRecord,
  deleteMedia,
  onReplaceBeforeAdd,
  label,
  multiple,
  disabled,
}: {
  propertyId: string;
  tenantId: string;
  destination: UploadDestination;
  displayOrderStart: number;
  createMediaRecord: (formData: FormData) => Promise<void>;
  deleteMedia?: (mediaId: string) => Promise<void>;
  onReplaceBeforeAdd?: string | null;
  label: string;
  multiple: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (onReplaceBeforeAdd && deleteMedia) {
      try {
        await deleteMedia(onReplaceBeforeAdd);
      } catch (err) {
        console.error("Replace: delete existing failed", err);
        alert("Could not replace. Please try again.");
        e.target.value = "";
        return;
      }
    }

    const fileArray = multiple ? Array.from(files) : [files[0]];
    let order = displayOrderStart;

    for (const file of fileArray) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      const filePath = `tenant/${tenantId}/property/${propertyId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Upload error", uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        e.target.value = "";
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(uploadData.path);
      const formData = new FormData();
      formData.append("property_id", propertyId);
      formData.append("tenant_id", tenantId);
      formData.append("media_type", destination.mediaType);
      formData.append("s3_url", publicUrl);
      formData.append("s3_key", uploadData.path);
      formData.append("alt_text", file.name);
      formData.append("display_order", String(order));
      formData.append("is_active", "true");
      if (destination.mediaType === "room_image" && destination.roomId) {
        formData.append("room_id", destination.roomId);
      }
      if (destination.mediaType === "host_image" && destination.hostId) {
        formData.append("host_id", destination.hostId);
      }

      try {
        await createMediaRecord(formData);
      } catch (err) {
        console.error("Create media record error", err);
        alert("Failed to save photo. Please try again.");
        e.target.value = "";
        return;
      }
      order += 1;
    }

    e.target.value = "";
    router.refresh();
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {label}
      </button>
    </>
  );
}
