import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireMembership } from "@/lib/authz";
import { MediaUpload } from "./MediaUpload";
import { MediaList } from "./MediaList";

async function createMediaRecord(formData: FormData) {
  "use server";
  // Verify user is authenticated and has permission
  const membership = await requireMembership();
  
  const property_id = String(formData.get("property_id") ?? "");
  const tenant_id = String(formData.get("tenant_id") ?? "");
  const media_type = String(formData.get("media_type") ?? "");
  const room_id = String(formData.get("room_id") ?? "").trim() || null;
  const s3_url = String(formData.get("s3_url") ?? "");
  const s3_key = String(formData.get("s3_key") ?? "");
  const alt_text = String(formData.get("alt_text") ?? "");
  const display_order = Number(formData.get("display_order")) || 0;
  const is_active = formData.get("is_active") === "true";

  // Verify tenant_id matches user's membership (unless agency_admin)
  if (membership.role !== "agency_admin" && membership.tenant_id !== tenant_id) {
    throw new Error("Unauthorized: tenant_id mismatch");
  }

  const supabase = await createSupabaseServerClient();
  
  // Explicitly get user to ensure session is loaded for RLS
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Authentication required");
  }

  // Verify property belongs to tenant (defense in depth)
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("tenant_id")
    .eq("id", property_id)
    .single();
  
  if (propError || !property) {
    throw new Error("Property not found");
  }
  
  if (membership.role !== "agency_admin" && property.tenant_id !== tenant_id) {
    throw new Error("Property does not belong to tenant");
  }

  const host_id = String(formData.get("host_id") ?? "").trim() || null;

  // Validate room_id for room images
  if (media_type === "room_image" && !room_id) {
    throw new Error("Room ID is required for room images");
  }

  // Validate host_id for host images
  if (media_type === "host_image" && !host_id) {
    throw new Error("Host ID is required for host images");
  }

  const { error, data } = await supabase.from("media").insert({
    property_id,
    tenant_id,
    media_type,
    room_id: room_id || null,
    host_id: host_id || null,
    s3_url,
    s3_key,
    alt_text,
    display_order,
    is_active,
  }).select();

  if (error) {
    throw error;
  }

  revalidatePath(`/admin/properties/${property_id}`);
}

async function getRooms(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name")
    .eq("property_id", propertyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

async function getHosts(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hosts")
    .select("id,name")
    .eq("property_id", propertyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function MediaTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const rooms = await getRooms(propertyId);
  const hosts = await getHosts(propertyId);
  
  return (
    <div>
      <h2 className="text-lg font-semibold">Media</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Upload and manage images for this property.
      </p>

      <div className="mt-6">
        <MediaUpload 
          propertyId={propertyId} 
          tenantId={tenantId}
          rooms={rooms}
          hosts={hosts}
          createMediaRecord={createMediaRecord}
        />
      </div>

      <div className="mt-6">
        <MediaList propertyId={propertyId} rooms={rooms} hosts={hosts} />
      </div>
    </div>
  );
}
