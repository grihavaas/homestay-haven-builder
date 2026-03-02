import { NextRequest, NextResponse } from "next/server";
import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("id, tenant_id")
      .eq("id", propertyId)
      .single();

    if (fetchError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const membership = await requireMembership(property.tenant_id);

    if (
      membership.role !== "tenant_admin" &&
      membership.role !== "agency_admin" &&
      membership.role !== "agency_rm"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch all media records for this property before deletion
    const { data: mediaRecords, error: mediaFetchError } = await supabase
      .from("media")
      .select("id, s3_key, s3_url")
      .eq("property_id", propertyId);

    if (mediaFetchError) {
      console.error("Error fetching media records:", mediaFetchError);
      // Continue with deletion even if media fetch fails
    }

    // Delete storage files from Supabase Storage
    const storageBucket = "media";
    if (mediaRecords && mediaRecords.length > 0) {
      const filesToDelete = mediaRecords
        .map((media) => media.s3_key)
        .filter((key): key is string => key !== null && key !== undefined);

      if (filesToDelete.length > 0) {
        const { error: storageDeleteError } = await supabase.storage
          .from(storageBucket)
          .remove(filesToDelete);

        if (storageDeleteError) {
          console.error("Error deleting storage files:", storageDeleteError);
          // Continue with property deletion even if storage deletion fails
          // The files will be orphaned but the property will still be deleted
        }
      }
    }

    // Also check for host images that might be associated with this property
    const { data: hosts, error: hostsFetchError } = await supabase
      .from("hosts")
      .select("id")
      .eq("property_id", propertyId);

    if (!hostsFetchError && hosts && hosts.length > 0) {
      const hostIds = hosts.map((h) => h.id);
      const { data: hostImages, error: hostImagesFetchError } = await supabase
        .from("host_images")
        .select("s3_key")
        .in("host_id", hostIds);

      if (!hostImagesFetchError && hostImages && hostImages.length > 0) {
        const hostImageKeys = hostImages
          .map((img) => img.s3_key)
          .filter((key): key is string => key !== null && key !== undefined);

        if (hostImageKeys.length > 0) {
          const { error: hostStorageDeleteError } = await supabase.storage
            .from(storageBucket)
            .remove(hostImageKeys);

          if (hostStorageDeleteError) {
            console.error("Error deleting host image storage files:", hostStorageDeleteError);
          }
        }
      }
    }

    // Delete the property (cascade deletes will handle related database records via foreign keys)
    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (deleteError) {
      console.error("Error deleting property:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete property", message: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error deleting property:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
