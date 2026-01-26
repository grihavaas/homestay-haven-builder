import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ZodError } from "zod";
import { propertyImportSchema } from "./json-import-schema";

interface ImportResult {
  success: boolean;
  propertyId?: string;
  error?: string;
  message?: string;
}

export async function importPropertyFromJSON(
  tenantId: string,
  jsonData: string
): Promise<ImportResult> {
  try {
    const supabase = createSupabaseBrowserClient();

    // Parse JSON
    let rawData;
    try {
      rawData = JSON.parse(jsonData);
    } catch (parseError) {
      return {
        success: false,
        error: "Invalid JSON format. Please check your JSON syntax.",
      };
    }

    // Validate with Zod schema
    let data;
    try {
      data = propertyImportSchema.parse(rawData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        return {
          success: false,
          error: "Validation failed",
          message: `Validation errors:\n${errorMessages.join("\n")}`,
        };
      }
      return {
        success: false,
        error: "Validation failed with unknown error",
      };
    }

    const propertyData = data.property;

    // Insert property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        tenant_id: tenantId,
        name: propertyData.name,
        type: propertyData.type || null,
        tagline: propertyData.tagline || null,
        description: propertyData.description || null,
        classification: propertyData.classification || null,
        slug: propertyData.slug,
        street_address: propertyData.street_address || null,
        city: propertyData.city || null,
        state: propertyData.state || null,
        country: propertyData.country,
        postal_code: propertyData.postal_code || null,
        location_description: propertyData.location_description || null,
        latitude: propertyData.latitude || null,
        longitude: propertyData.longitude || null,
        phone: propertyData.phone || null,
        email: propertyData.email || null,
        meta_title: propertyData.meta_title || null,
        meta_description: propertyData.meta_description || null,
        is_active: true,
        is_published: false,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("Property insert error:", propertyError);
      return {
        success: false,
        error: `Failed to create property: ${propertyError.message}`,
      };
    }

    const propertyId = property.id;
    let importStats = {
      rooms: 0,
      hosts: 0,
      reviewSources: 0,
      proximityInfo: 0,
      attractions: 0,
      features: 0,
      offers: 0,
      rules: 0,
      pricing: 0,
      socialLinks: 0,
      paymentMethods: 0,
      bookingCtas: 0,
    };
    const errors: string[] = [];

    // Insert rooms
    if (data.rooms && Array.isArray(data.rooms)) {
      for (const room of data.rooms) {
        const { data: roomRecord, error: roomError } = await supabase
          .from("rooms")
          .insert({
            property_id: propertyId,
            tenant_id: tenantId,
            name: room.name,
            description: room.description || null,
            max_guests: room.max_guests || null,
            adults_capacity: room.adults_capacity || null,
            children_capacity: room.children_capacity || null,
            extra_beds_available: room.extra_beds_available ?? false,
            extra_beds_count: room.extra_beds_count || null,
            room_size_sqft: room.room_size_sqft || null,
            view_type: room.view_type || null,
            room_features: room.room_features || null,
            base_rate: room.base_rate || null,
            currency: room.currency || "USD",
            is_active: true,
          })
          .select()
          .single();

        if (roomError) {
          errors.push(`Room "${room.name}": ${roomError.message}`);
        } else if (roomRecord) {
          importStats.rooms++;

          // Insert bed configurations
          if (room.bed_configurations && Array.isArray(room.bed_configurations)) {
            for (const bed of room.bed_configurations) {
              await supabase.from("bed_configurations").insert({
                room_id: roomRecord.id,
                tenant_id: tenantId,
                bed_type: bed.bed_type,
                bed_count: bed.bed_count,
                is_sofa_bed: bed.is_sofa_bed ?? false,
                is_extra_bed: bed.is_extra_bed ?? false,
              });
            }
          }

          // Insert room amenities
          if (room.room_amenities && Array.isArray(room.room_amenities)) {
            for (const amenity of room.room_amenities) {
              const { data: existingAmenity } = await supabase
                .from("standard_amenities")
                .select("id")
                .eq("name", amenity)
                .single();

              if (existingAmenity) {
                await supabase.from("room_amenities").insert({
                  room_id: roomRecord.id,
                  amenity_id: existingAmenity.id,
                });
              }
            }
          }
        }
      }
    }

    // Insert hosts
    if (data.hosts && Array.isArray(data.hosts)) {
      for (const host of data.hosts) {
        const { data: hostRecord, error: hostError } = await supabase
          .from("hosts")
          .insert({
            property_id: propertyId,
            tenant_id: tenantId,
            name: host.name,
            title: host.title || null,
            bio: host.bio || null,
            writeup: host.writeup || null,
            email: host.email || null,
            phone: host.phone || null,
            whatsapp: host.whatsapp || null,
            response_time: host.response_time || null,
          })
          .select()
          .single();

        if (hostError) {
          errors.push(`Host "${host.name}": ${hostError.message}`);
        } else if (hostRecord) {
          importStats.hosts++;

        }
      }
    }

    // Insert other data (simplified - can be extended)
    if (data.review_sources && Array.isArray(data.review_sources)) {
      for (const review of data.review_sources) {
        const { error } = await supabase.from("review_sources").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          site_name: review.site_name,
          stars: review.stars || null,
          total_reviews: review.total_reviews || null,
          review_url: review.review_url || null,
          display_order: 0,
        });
        if (!error) importStats.reviewSources++;
      }
    }

    // Insert property amenities
    if (data.property_amenities && Array.isArray(data.property_amenities)) {
      for (const amenity of data.property_amenities) {
        const { data: existingAmenity } = await supabase
          .from("standard_amenities")
          .select("id")
          .eq("name", amenity)
          .single();

        if (existingAmenity) {
          await supabase.from("property_amenities").insert({
            property_id: propertyId,
            amenity_id: existingAmenity.id,
          });
        }
      }
    }

    // Insert property tags
    if (data.property_tags && Array.isArray(data.property_tags)) {
      for (const tag of data.property_tags) {
        const { data: existingTag } = await supabase
          .from("standard_property_tags")
          .select("id")
          .eq("name", tag)
          .single();

        if (existingTag) {
          await supabase.from("property_tags").insert({
            property_id: propertyId,
            tag_id: existingTag.id,
          });
        }
      }
    }

    // Note: Additional imports (pricing, offers, rules, etc.) can be added here
    // following the same pattern

    const resultMessage = `Successfully imported property "${propertyData.name}" with ${importStats.rooms} rooms, ${importStats.hosts} hosts, and more.${
      errors.length > 0
        ? "\n\nWarnings:\n" +
          errors.slice(0, 5).join("\n") +
          (errors.length > 5 ? `\n... and ${errors.length - 5} more` : "")
        : ""
    }`;

    return {
      success: true,
      propertyId,
      message: resultMessage,
    };
  } catch (error) {
    console.error("JSON import error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
