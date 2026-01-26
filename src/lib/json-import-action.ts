"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { propertyImportSchema } from "@/lib/json-import-schema";
import { ZodError } from "zod";

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
    const supabase = await createSupabaseServerClient();
    
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
        const errorMessages = error.errors.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        return {
          success: false,
          error: "Validation failed",
          message: `Validation errors:\n${errorMessages.join('\n')}`,
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
      console.log(`Importing ${data.rooms.length} rooms...`);
      for (const room of data.rooms) {
        console.log(`Inserting room: ${room.name}`);
        const { data: roomRecord, error: roomError } = await supabase
          .from("rooms")
          .insert({
            property_id: propertyId,
            tenant_id: tenantId,  // REQUIRED FIELD
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
            is_active: true,  // Fixed: was is_available
          })
          .select()
          .single();

        if (roomError) {
          console.error(`Error inserting room "${room.name}":`, roomError);
          errors.push(`Room "${room.name}": ${roomError.message}`);
        }

        if (!roomError && roomRecord) {
          console.log(`Room "${room.name}" created with ID: ${roomRecord.id}`);
          importStats.rooms++;

          // Insert bed configurations
          if (room.bed_configurations && Array.isArray(room.bed_configurations)) {
            for (const bed of room.bed_configurations) {
              await supabase.from("bed_configurations").insert({
                room_id: roomRecord.id,
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
              // Check if amenity exists
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
      console.log(`Importing ${data.hosts.length} hosts...`);
      for (const host of data.hosts) {
        const { data: hostRecord, error: hostError } = await supabase.from("hosts").insert({
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
        }).select().single();

        if (hostError) {
          console.error(`Error inserting host "${host.name}":`, hostError);
          errors.push(`Host "${host.name}": ${hostError.message}`);
        } else {
          importStats.hosts++;
        }
      }
    }

    // Insert review sources
    if (data.review_sources && Array.isArray(data.review_sources)) {
      for (const review of data.review_sources) {
        const { error: reviewError } = await supabase.from("review_sources").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          site_name: review.site_name,
          stars: review.stars || null,
          total_reviews: review.total_reviews || null,
          review_url: review.review_url || null,
          display_order: 0,
        });

        if (!reviewError) importStats.reviewSources++;
      }
    }

    // Insert proximity info
    if (data.proximity_info && Array.isArray(data.proximity_info)) {
      for (const prox of data.proximity_info) {
        const { error: proxError } = await supabase.from("proximity_info").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          point_of_interest: prox.landmark_name,
          distance: prox.distance_km || null,
          distance_unit: "km",
          description: prox.distance_text || null,
        });

        if (!proxError) importStats.proximityInfo++;
      }
    }

    // Insert nearby attractions
    if (data.nearby_attractions && Array.isArray(data.nearby_attractions)) {
      for (const attraction of data.nearby_attractions) {
        const { error: attractionError } = await supabase
          .from("nearby_attractions")
          .insert({
            property_id: propertyId,
            tenant_id: tenantId,
            name: attraction.name,
            type: attraction.type || null,
            distance: attraction.distance_km || null,
            distance_unit: "km",
            description: attraction.description || null,
            transportation_info: null,
            display_order: 0,
          });

        if (!attractionError) importStats.attractions++;
      }
    }

    // Insert property features
    if (data.property_features && Array.isArray(data.property_features)) {
      console.log(`Importing ${data.property_features.length} property features...`);
      for (const feature of data.property_features) {
        console.log(`Inserting feature: ${feature.feature_type}`);
        const { error: featureError } = await supabase
          .from("property_features")
          .insert({
            property_id: propertyId,
            tenant_id: tenantId,
            feature_type: feature.feature_type,
            description: feature.description,
            display_order: 0,
          });

        if (featureError) {
          console.error(`Error inserting feature "${feature.feature_type}":`, featureError);
          errors.push(`Feature "${feature.feature_type}": ${featureError.message}`);
        } else {
          importStats.features++;
        }
      }
    }

    // Insert booking settings
    if (data.booking_settings) {
      const { error: bookingError } = await supabase.from("booking_settings").insert({
        property_id: propertyId,
        tenant_id: tenantId,
        check_in_time: data.booking_settings.check_in_time || null,
        check_out_time: data.booking_settings.check_out_time || null,
        min_stay_nights: data.booking_settings.min_stay_nights || null,
        max_stay_nights: data.booking_settings.max_stay_nights || null,
        age_restrictions: data.booking_settings.age_restrictions || null,
        group_booking_policy: data.booking_settings.group_booking_policy || null,
        cancellation_full_refund_policy: data.booking_settings.cancellation_full_refund_policy || null,
        cancellation_full_refund_hours: data.booking_settings.cancellation_full_refund_hours || null,
        cancellation_partial_refund_policy: data.booking_settings.cancellation_partial_refund_policy || null,
        cancellation_partial_refund_hours: data.booking_settings.cancellation_partial_refund_hours || null,
        cancellation_no_refund_policy: data.booking_settings.cancellation_no_refund_policy || null,
        deposit_required: data.booking_settings.deposit_required ?? false,
        deposit_type: data.booking_settings.deposit_type || null,
        deposit_value: data.booking_settings.deposit_value || null,
        payment_terms: data.booking_settings.payment_terms || null,
      });

      if (bookingError) {
        console.error("Error inserting booking settings:", bookingError);
        errors.push(`Booking settings: ${bookingError.message}`);
      }
    }

    // Insert special offers
    if (data.special_offers && Array.isArray(data.special_offers)) {
      console.log(`Importing ${data.special_offers.length} special offers...`);
      for (const offer of data.special_offers) {
        console.log(`Inserting offer: ${offer.title}`);
        const { error: offerError } = await supabase.from("special_offers").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          offer_type: offer.offer_type,
          title: offer.title,
          description: offer.description || null,
          discount_percentage: offer.discount_percentage || null,
          discount_amount: offer.discount_amount || null,
          valid_from: offer.valid_from || null,
          valid_to: offer.valid_to || null,
          is_active: true,
        });

        if (offerError) {
          console.error(`Error inserting offer "${offer.title}":`, offerError);
          errors.push(`Offer "${offer.title}": ${offerError.message}`);
        } else {
          importStats.offers++;
        }
      }
    }

    // Insert rules and policies
    if (data.rules_and_policies && Array.isArray(data.rules_and_policies)) {
      for (const rule of data.rules_and_policies) {
        const { error: ruleError } = await supabase.from("rules_and_policies").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          rule_type: rule.rule_type,
          rule_text: rule.rule_text,
          display_order: rule.display_order || 0,
        });

        if (!ruleError) importStats.rules++;
      }
    }

    // Insert pricing (must be after rooms are created)
    if (data.pricing && Array.isArray(data.pricing)) {
      console.log(`Importing ${data.pricing.length} pricing records...`);
      // Get all rooms for this property to map names to IDs
      const { data: propertyRooms } = await supabase
        .from("rooms")
        .select("id, name")
        .eq("property_id", propertyId);

      if (propertyRooms) {
        const roomMap = new Map(propertyRooms.map(r => [r.name, r.id]));

        for (const price of data.pricing) {
          const roomId = roomMap.get(price.room_name);
          if (roomId) {
            console.log(`Inserting pricing for room: ${price.room_name}`);
            const { error: priceError } = await supabase.from("pricing").insert({
              room_id: roomId,
              tenant_id: tenantId,
              base_rate: price.base_rate,
              discounted_rate: price.discounted_rate || null,
              original_price: price.original_price || null,
              currency: price.currency || "USD",
              valid_from: price.valid_from || null,
              valid_to: price.valid_to || null,
              pricing_type: "per_night", // Always per night
            });

            if (priceError) {
              console.error(`Error inserting pricing for "${price.room_name}":`, priceError);
              errors.push(`Pricing "${price.room_name}": ${priceError.message}`);
            } else {
              importStats.pricing++;
            }
          } else {
            console.warn(`Room "${price.room_name}" not found, skipping pricing`);
            errors.push(`Pricing: Room "${price.room_name}" not found`);
          }
        }
      }
    }

    // Insert social media links
    if (data.social_media_links && Array.isArray(data.social_media_links)) {
      console.log(`Importing ${data.social_media_links.length} social media links...`);
      for (const social of data.social_media_links) {
        console.log(`Inserting social link: ${social.platform}`);
        const { error: socialError } = await supabase.from("social_media_links").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          platform: social.platform,
          url: social.url,
        });

        if (socialError) {
          console.error(`Error inserting social link "${social.platform}":`, socialError);
          errors.push(`Social link "${social.platform}": ${socialError.message}`);
        } else {
          importStats.socialLinks++;
        }
      }
    }

    // Insert payment methods
    if (data.payment_methods && Array.isArray(data.payment_methods)) {
      console.log(`Importing ${data.payment_methods.length} payment methods...`);
      for (const payment of data.payment_methods) {
        console.log(`Inserting payment method: ${payment.payment_type}`);
        const { error: paymentError } = await supabase.from("payment_methods").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          payment_type: payment.payment_type,
          is_available: payment.is_available ?? true,
        });

        if (paymentError) {
          console.error(`Error inserting payment method "${payment.payment_type}":`, paymentError);
          errors.push(`Payment method "${payment.payment_type}": ${paymentError.message}`);
        } else {
          importStats.paymentMethods++;
        }
      }
    }

    // Insert booking CTAs
    if (data.booking_ctas && Array.isArray(data.booking_ctas)) {
      console.log(`Importing ${data.booking_ctas.length} booking CTAs...`);
      for (const cta of data.booking_ctas) {
        console.log(`Inserting CTA: ${cta.cta_type}`);
        const { error: ctaError } = await supabase.from("booking_ctas").insert({
          property_id: propertyId,
          tenant_id: tenantId,
          cta_type: cta.cta_type,
          label: cta.label,
          url: cta.url || null,
          phone_number: cta.phone_number || null,
          is_active: cta.is_active ?? true,
          display_order: cta.display_order || 0,
        });

        if (ctaError) {
          console.error(`Error inserting CTA "${cta.cta_type}":`, ctaError);
          errors.push(`CTA "${cta.cta_type}": ${ctaError.message}`);
        } else {
          importStats.bookingCtas++;
        }
      }
    }

    // Insert property amenities (junction)
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

    // Insert property tags (junction)
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

    revalidatePath("/admin/properties");

    const resultMessage = `Successfully imported property "${propertyData.name}" with ${importStats.rooms} rooms, ${importStats.hosts} hosts, ${importStats.features} features, and more.${errors.length > 0 ? '\n\nWarnings:\n' + errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... and ${errors.length - 5} more` : '') : ''}`;

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
