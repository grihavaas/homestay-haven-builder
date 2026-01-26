import { z } from "zod";

// Bed Configuration Schema
const bedConfigurationSchema = z.object({
  bed_type: z.string().min(1, "Bed type is required"),
  bed_count: z.number().int().positive("Bed count must be positive"),
  is_sofa_bed: z.boolean().optional().default(false),
  is_extra_bed: z.boolean().optional().default(false),
});

// Room Schema
const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  max_guests: z.number().int().positive("Max guests must be positive"),
  adults_capacity: z.number().int().nonnegative("Adults capacity must be non-negative").optional(),
  children_capacity: z.number().int().nonnegative("Children capacity must be non-negative").optional(),
  extra_beds_available: z.boolean().optional().default(false),
  extra_beds_count: z.number().int().nonnegative("Extra beds count must be non-negative").optional(),
  room_size_sqft: z.number().positive("Room size must be positive").optional(),
  view_type: z.string().optional(),
  room_features: z.string().optional(),
  base_rate: z.number().positive("Base rate must be positive").optional(),
  currency: z.string().length(3, "Currency must be 3-letter code (e.g., USD)").optional(),
  bed_configurations: z.array(bedConfigurationSchema).optional(),
  room_amenities: z.array(z.string()).optional(),
});

// Host Schema
const hostSchema = z.object({
  name: z.string().min(1, "Host name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  writeup: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  response_time: z.string().optional(),
});

// Review Source Schema
const reviewSourceSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  stars: z.number().min(0).max(5, "Stars must be between 0 and 5").optional(),
  total_reviews: z.number().int().nonnegative("Total reviews must be non-negative").optional(),
  review_url: z.string().url("Invalid review URL").optional(),
});

// Proximity Info Schema
const proximityInfoSchema = z.object({
  landmark_name: z.string().min(1, "Landmark name is required"),
  distance_text: z.string().min(1, "Distance text is required"),
  distance_km: z.number().positive("Distance must be positive").optional(),
  travel_time: z.string().optional(),
  transport_mode: z.string().optional(),
});

// Nearby Attraction Schema
const nearbyAttractionSchema = z.object({
  name: z.string().min(1, "Attraction name is required"),
  type: z.string().optional(),
  distance_km: z.number().positive("Distance must be positive").optional(),
  description: z.string().optional(),
});

// Property Feature Schema
const propertyFeatureSchema = z.object({
  feature_type: z.string().min(1, "Feature type is required"),
  description: z.string().min(1, "Description is required"),
  display_order: z.number().int().nonnegative("Display order must be non-negative").optional(),
});

// Booking Settings Schema
const bookingSettingsSchema = z.object({
  check_in_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Check-in time must be in HH:MM:SS format").optional(),
  check_out_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Check-out time must be in HH:MM:SS format").optional(),
  min_stay_nights: z.number().int().positive("Min stay must be positive").optional(),
  max_stay_nights: z.number().int().positive("Max stay must be positive").optional(),
  age_restrictions: z.string().optional(),
  group_booking_policy: z.string().optional(),
  cancellation_full_refund_policy: z.string().optional(),
  cancellation_full_refund_hours: z.number().int().nonnegative("Hours must be non-negative").optional(),
  cancellation_partial_refund_policy: z.string().optional(),
  cancellation_partial_refund_hours: z.number().int().nonnegative("Hours must be non-negative").optional(),
  cancellation_no_refund_policy: z.string().optional(),
  deposit_required: z.boolean().optional().default(false),
  deposit_type: z.enum(["percentage", "fixed", "nights"]).optional(),
  deposit_value: z.number().positive("Deposit value must be positive").optional(),
  payment_terms: z.string().optional(),
});

// Pricing Schema
const pricingSchema = z.object({
  room_name: z.string().min(1, "Room name is required"),
  base_rate: z.number().positive("Base rate must be positive"),
  discounted_rate: z.number().positive("Discounted rate must be positive").optional(),
  original_price: z.number().positive("Original price must be positive").optional(),
  currency: z.string().length(3, "Currency must be 3-letter code").optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid from must be in YYYY-MM-DD format").optional(),
  valid_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid to must be in YYYY-MM-DD format").optional(),
});

// Special Offer Schema
const specialOfferSchema = z.object({
  offer_type: z.enum(["early_bird", "last_minute", "package", "long_stay", "family", "weekend", "weekday"]),
  title: z.string().min(1, "Offer title is required"),
  description: z.string().optional(),
  discount_percentage: z.number().min(0).max(100, "Discount percentage must be between 0 and 100").optional(),
  discount_amount: z.number().positive("Discount amount must be positive").optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid from must be in YYYY-MM-DD format").optional(),
  valid_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid to must be in YYYY-MM-DD format").optional(),
});

// Rules and Policies Schema
const rulesAndPoliciesSchema = z.object({
  rule_type: z.enum(["house_rules", "check_in_requirements", "cancellation", "terms", "privacy"]),
  rule_text: z.string().min(1, "Rule text is required"),
  display_order: z.number().int().nonnegative("Display order must be non-negative").optional(),
});

// Social Media Schema
const socialMediaSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Invalid URL"),
});

// Payment Method Schema
const paymentMethodSchema = z.object({
  payment_type: z.string().min(1, "Payment type is required"),
  is_available: z.boolean().optional().default(true),
});

// Booking CTA Schema
const bookingCtaSchema = z.object({
  cta_type: z.enum(["book_now", "enquire_now", "call_to_book", "whatsapp"]),
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Invalid URL").optional(),
  phone_number: z.string().optional(),
  is_active: z.boolean().optional().default(true),
  display_order: z.number().int().nonnegative("Display order must be non-negative").optional(),
});

// Main Property Import Schema
export const propertyImportSchema = z.object({
  property: z.object({
    name: z.string().min(1, "Property name is required"),
    type: z.string().optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    classification: z.string().optional(),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    street_address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    location_description: z.string().optional(),
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90").optional(),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180").optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    website: z.string().url("Invalid website URL").optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    check_in_time: z.string().optional(),
    check_out_time: z.string().optional(),
    year_built: z.number().int().min(1800).max(new Date().getFullYear(), "Invalid year").optional(),
    year_renovated: z.number().int().min(1800).max(new Date().getFullYear(), "Invalid year").optional(),
    total_rooms: z.number().int().positive("Total rooms must be positive").optional(),
    total_floors: z.number().int().positive("Total floors must be positive").optional(),
    is_published: z.boolean().optional().default(false),
  }),
  rooms: z.array(roomSchema).optional(),
  hosts: z.array(hostSchema).optional(),
  review_sources: z.array(reviewSourceSchema).optional(),
  proximity_info: z.array(proximityInfoSchema).optional(),
  nearby_attractions: z.array(nearbyAttractionSchema).optional(),
  property_features: z.array(propertyFeatureSchema).optional(),
  booking_settings: bookingSettingsSchema.optional(),
  pricing: z.array(pricingSchema).optional(),
  special_offers: z.array(specialOfferSchema).optional(),
  rules_and_policies: z.array(rulesAndPoliciesSchema).optional(),
  social_media_links: z.array(socialMediaSchema).optional(),
  payment_methods: z.array(paymentMethodSchema).optional(),
  booking_ctas: z.array(bookingCtaSchema).optional(),
  property_amenities: z.array(z.string()).optional(),
  property_tags: z.array(z.string()).optional(),
});

export type PropertyImportData = z.infer<typeof propertyImportSchema>;
