import { supabase } from "./supabase";

export async function resolvePropertyIdByHostname(hostname: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("domains")
    .select("property_id")
    .eq("hostname", hostname)
    .maybeSingle();
  if (error) throw error;
  return data?.property_id ?? null;
}

export async function fetchPublishedProperty(propertyId: string) {
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("is_published", true)
    .maybeSingle();
  if (propError) throw propError;
  if (!property) return null;

  const [rooms, media, reviewSources, hosts, attractions, proximity, features, booking, propertyTags, pricing, propertyAmenities, paymentMethods, bookingCTAs, rules, socialMedia] = await Promise.all([
    supabase.from("rooms").select("*").eq("property_id", propertyId).eq("is_active", true).order("created_at"),
    supabase.from("media").select("*,host_id").eq("property_id", propertyId).eq("is_active", true).order("display_order"),
    supabase.from("review_sources").select("*").eq("property_id", propertyId).order("display_order"),
    supabase.from("hosts").select("*").eq("property_id", propertyId),
    supabase.from("nearby_attractions").select("*").eq("property_id", propertyId).order("display_order"),
    supabase.from("proximity_info").select("*").eq("property_id", propertyId),
    supabase.from("property_features").select("*").eq("property_id", propertyId).order("display_order"),
    supabase.from("booking_settings").select("*").eq("property_id", propertyId).maybeSingle(),
    supabase.from("property_tags").select("standard_property_tags(name)").eq("property_id", propertyId),
    supabase.from("pricing").select("*").in("room_id", []), // Will be populated after rooms are fetched
    supabase.from("property_amenities").select("standard_amenities(*)").eq("property_id", propertyId),
    supabase.from("payment_methods").select("*").eq("property_id", propertyId).eq("is_available", true),
    supabase.from("booking_ctas").select("*").eq("property_id", propertyId).eq("is_active", true).order("display_order"),
    supabase.from("rules_and_policies").select("*").eq("property_id", propertyId).order("display_order"),
    supabase.from("social_media_links").select("*").eq("property_id", propertyId),
  ]);
  
  // Get room IDs and host IDs for related data
  const roomIds = (rooms.data ?? []).map((r: any) => r.id);
  const hostIds = (hosts.data ?? []).map((h: any) => h.id);
  
  // Fetch related data for rooms and hosts
  const [pricingData, bedConfigs, roomAmenities, hostLanguages] = await Promise.all([
    roomIds.length > 0
      ? supabase.from("pricing").select("*").in("room_id", roomIds).order("valid_from")
      : { data: [], error: null },
    roomIds.length > 0
      ? supabase.from("bed_configurations").select("*").in("room_id", roomIds)
      : { data: [], error: null },
    roomIds.length > 0
      ? supabase.from("room_amenities").select("room_id,standard_amenities(*)").in("room_id", roomIds)
      : { data: [], error: null },
    hostIds.length > 0
      ? supabase.from("host_languages").select("host_id,language").in("host_id", hostIds)
      : { data: [], error: null },
  ]);

  if (rooms.error || media.error || reviewSources.error || hosts.error || attractions.error || proximity.error || features.error || booking.error || propertyTags.error || propertyAmenities.error || paymentMethods.error || bookingCTAs.error || rules.error || socialMedia.error) {
    throw new Error("Failed to fetch related data");
  }

  // Extract tag names from the joined data
  const tags = (propertyTags.data ?? []).map((pt: any) => pt.standard_property_tags?.name).filter(Boolean);
  
  // Extract amenity data from the joined data
  const amenities = (propertyAmenities.data ?? []).map((pa: any) => pa.standard_amenities).filter(Boolean);
  
  // Attach pricing, bed configurations, and amenities to rooms
  const roomsWithRelated = (rooms.data ?? []).map((room: any) => {
    const roomBeds = (bedConfigs.data ?? []).filter((b: any) => b.room_id === room.id);
    const roomAmenitiesData = (roomAmenities.data ?? [])
      .filter((ra: any) => ra.room_id === room.id)
      .map((ra: any) => ra.standard_amenities)
      .filter(Boolean);
    
    return {
      ...room,
      pricing: (pricingData.data ?? []).filter((p: any) => p.room_id === room.id),
      bed_configurations: roomBeds,
      room_amenities: roomAmenitiesData,
    };
  });
  
  // Attach languages to hosts
  const hostsWithLanguages = (hosts.data ?? []).map((host: any) => {
    const languages = (hostLanguages.data ?? [])
      .filter((hl: any) => hl.host_id === host.id)
      .map((hl: any) => hl.language);
    
    return {
      ...host,
      languages: languages,
    };
  });

  return {
    ...property,
    rooms: roomsWithRelated,
    media: media.data ?? [],
    review_sources: reviewSources.data ?? [],
    hosts: hostsWithLanguages,
    nearby_attractions: attractions.data ?? [],
    proximity_info: proximity.data ?? [],
    property_features: features.data ?? [],
    booking_settings: booking.data ?? null,
    property_tags: tags,
    amenities: amenities,
    payment_methods: paymentMethods.data ?? [],
    booking_ctas: bookingCTAs.data ?? [],
    rules_and_policies: rules.data ?? [],
    social_media_links: socialMedia.data ?? [],
  };
}
