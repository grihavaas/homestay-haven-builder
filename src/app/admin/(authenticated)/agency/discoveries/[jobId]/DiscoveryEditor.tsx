"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PropertyImportData } from "@/lib/json-import-schema";
import { validateImportData, type ValidationError } from "@/lib/json-import-schema";
import { toast } from "@/hooks/use-toast";
import { DiscoveryTabs } from "./DiscoveryTabs";
import { DiscoveryBasicInfo } from "./DiscoveryBasicInfo";
import { DiscoveryBooking } from "./DiscoveryBooking";
import { DiscoveryAmenities } from "./DiscoveryAmenities";
import { RoomsManager } from "@/components/property-forms/RoomsManager";
import { HostsManager } from "@/components/property-forms/HostsManager";
import { ReviewsManager } from "@/components/property-forms/ReviewsManager";
import { PricingManager } from "@/components/property-forms/PricingManager";
import { AttractionsManager } from "@/components/property-forms/AttractionsManager";
import { PromotionsManager } from "@/components/property-forms/PromotionsManager";
import { RulesManager } from "@/components/property-forms/RulesManager";
import { AdditionalManager } from "@/components/property-forms/AdditionalManager";
import { DiscoveryImages } from "./DiscoveryImages";
import { DiscoveryVisionDebug } from "./DiscoveryVisionDebug";
import { ImportToTenantDialog } from "./ImportToTenantDialog";

type Tenant = { id: string; name: string };

type JobMeta = {
  importedAt?: string;
  importedToTenantId?: string;
};

// Add temporary IDs to array items
function withIds<T extends Record<string, unknown>>(items: T[]): (T & { id: string })[] {
  return items.map((item) => ({
    ...item,
    id: (item.id as string) || crypto.randomUUID(),
  }));
}

export function DiscoveryEditor({
  initialData,
  jobId,
  tenants,
  jobMeta,
}: {
  initialData: PropertyImportData;
  jobId: string;
  tenants: Tenant[];
  jobMeta: JobMeta;
}) {
  const router = useRouter();
  const [data, setData] = useState<PropertyImportData>(initialData);
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: ValidationError[];
    errorsByTab: Record<string, ValidationError[]>;
  } | null>(null);

  const isImported = !!jobMeta.importedAt;

  // Build a set of error paths for field-level highlighting
  const errorPaths = useMemo(() => {
    if (!validationResult) return new Set<string>();
    return new Set(validationResult.errors.map((e) => e.path));
  }, [validationResult]);

  function handleValidate() {
    const result = validateImportData(data);
    setValidationResult(result);
    setValidated(true);
    if (result.valid) {
      toast({ title: "Valid", description: "All fields pass validation." });
    } else {
      toast({
        title: "Validation Errors",
        description: `${result.errors.length} error(s) found. Check highlighted tabs and fields.`,
        variant: "destructive",
      });
      // Navigate to first tab with errors
      const firstTabWithError = Object.keys(result.errorsByTab)[0];
      if (firstTabWithError) setActiveTab(firstTabWithError);
    }
  }

  // Re-run validation automatically when data changes (if already validated)
  useEffect(() => {
    if (validated) {
      const result = validateImportData(data);
      setValidationResult(result);
    }
  }, [data, validated]);

  const markDirty = useCallback(() => {
    setDirty(true);
  }, []);

  // --- Save to backend ---
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/discoveries/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      setDirty(false);
      toast({ title: "Saved", description: "Discovery updated." });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // --- FormData-backed mutation helpers ---

  // Rooms
  const rooms = withIds(data.rooms || []);
  const createRoom = async (formData: FormData) => {
    const room = {
      id: crypto.randomUUID(),
      name: String(formData.get("name") ?? ""),
      max_guests: Number(formData.get("max_guests") ?? 2),
      description: String(formData.get("description") ?? "") || undefined,
      adults_capacity: Number(formData.get("adults_capacity")) || undefined,
      children_capacity: Number(formData.get("children_capacity")) || undefined,
      extra_beds_available: formData.get("extra_beds_available") === "on",
      extra_beds_count: Number(formData.get("extra_beds_count")) || undefined,
      room_size_sqft: Number(formData.get("room_size_sqft")) || undefined,
      view_type: String(formData.get("view_type") ?? "") || undefined,
      room_features: String(formData.get("room_features") ?? "") || undefined,
      base_rate: Number(formData.get("base_rate")) || undefined,
      currency: String(formData.get("currency") ?? "") || undefined,
    };
    setData((prev) => ({ ...prev, rooms: [...(prev.rooms || []), room] }));
    markDirty();
  };
  const updateRoom = async (formData: FormData) => {
    const roomId = String(formData.get("roomId"));
    setData((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).map((r) =>
        (r as Record<string, unknown>).id === roomId
          ? {
              ...r,
              name: String(formData.get("name") ?? r.name),
              max_guests: Number(formData.get("max_guests") ?? r.max_guests),
              description: String(formData.get("description") ?? "") || undefined,
              adults_capacity: Number(formData.get("adults_capacity")) || undefined,
              children_capacity: Number(formData.get("children_capacity")) || undefined,
              extra_beds_available: formData.get("extra_beds_available") === "on",
              extra_beds_count: Number(formData.get("extra_beds_count")) || undefined,
              room_size_sqft: Number(formData.get("room_size_sqft")) || undefined,
              view_type: String(formData.get("view_type") ?? "") || undefined,
              room_features: String(formData.get("room_features") ?? "") || undefined,
              base_rate: Number(formData.get("base_rate")) || undefined,
              currency: String(formData.get("currency") ?? "") || undefined,
            }
          : r,
      ),
    }));
    markDirty();
  };
  const deleteRoom = async (formData: FormData) => {
    const roomId = String(formData.get("roomId"));
    setData((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).filter((r) => (r as Record<string, unknown>).id !== roomId),
    }));
    markDirty();
  };
  // Bed mutations (no-op for discovery — beds are embedded in room data)
  const addBed = async (_formData: FormData) => {};
  const deleteBed = async (_formData: FormData) => {};
  const updateRoomAmenities = async (_formData: FormData) => {};

  // Hosts
  const hosts = withIds(data.hosts || []);
  const createHost = async (formData: FormData) => {
    const host = {
      id: crypto.randomUUID(),
      name: String(formData.get("name") ?? ""),
      title: String(formData.get("title") ?? "") || undefined,
      bio: String(formData.get("bio") ?? "") || undefined,
      writeup: String(formData.get("writeup") ?? "") || undefined,
      email: String(formData.get("email") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      whatsapp: String(formData.get("whatsapp") ?? "") || undefined,
      response_time: String(formData.get("response_time") ?? "") || undefined,
    };
    setData((prev) => ({ ...prev, hosts: [...(prev.hosts || []), host] }));
    markDirty();
  };
  const updateHost = async (formData: FormData) => {
    const hostId = String(formData.get("hostId"));
    setData((prev) => ({
      ...prev,
      hosts: (prev.hosts || []).map((h) =>
        (h as Record<string, unknown>).id === hostId
          ? {
              ...h,
              name: String(formData.get("name") ?? (h as Record<string, unknown>).name),
              title: String(formData.get("title") ?? "") || undefined,
              bio: String(formData.get("bio") ?? "") || undefined,
              writeup: String(formData.get("writeup") ?? "") || undefined,
              email: String(formData.get("email") ?? "") || undefined,
              phone: String(formData.get("phone") ?? "") || undefined,
              whatsapp: String(formData.get("whatsapp") ?? "") || undefined,
              response_time: String(formData.get("response_time") ?? "") || undefined,
            }
          : h,
      ),
    }));
    markDirty();
  };
  const deleteHost = async (formData: FormData) => {
    const hostId = String(formData.get("hostId"));
    setData((prev) => ({
      ...prev,
      hosts: (prev.hosts || []).filter((h) => (h as Record<string, unknown>).id !== hostId),
    }));
    markDirty();
  };

  // Reviews
  const reviews = withIds(data.review_sources || []);
  const createReview = async (formData: FormData) => {
    const review = {
      id: crypto.randomUUID(),
      site_name: String(formData.get("site_name") ?? ""),
      stars: Number(formData.get("stars")) || undefined,
      total_reviews: Number(formData.get("total_reviews")) || undefined,
      review_url: String(formData.get("review_url") ?? "") || undefined,
    };
    setData((prev) => ({ ...prev, review_sources: [...(prev.review_sources || []), review] }));
    markDirty();
  };
  const updateReview = async (formData: FormData) => {
    const reviewId = String(formData.get("reviewId"));
    setData((prev) => ({
      ...prev,
      review_sources: (prev.review_sources || []).map((r) =>
        (r as Record<string, unknown>).id === reviewId
          ? {
              ...r,
              site_name: String(formData.get("site_name") ?? ""),
              stars: Number(formData.get("stars")) || undefined,
              total_reviews: Number(formData.get("total_reviews")) || undefined,
              review_url: String(formData.get("review_url") ?? "") || undefined,
            }
          : r,
      ),
    }));
    markDirty();
  };
  const deleteReview = async (formData: FormData) => {
    const reviewId = String(formData.get("reviewId"));
    setData((prev) => ({
      ...prev,
      review_sources: (prev.review_sources || []).filter(
        (r) => (r as Record<string, unknown>).id !== reviewId,
      ),
    }));
    markDirty();
  };

  // Pricing
  const pricing = withIds(
    (data.pricing || []).map((p) => ({
      ...p,
      room_id: "",
      room_name: p.room_name,
    })),
  );
  const pricingRooms = rooms.map((r) => ({ id: r.id, name: r.name }));
  const createPricing = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      room_name: String(formData.get("room_name") ?? ""),
      base_rate: Number(formData.get("base_rate") ?? 0),
      discounted_rate: Number(formData.get("discounted_rate")) || undefined,
      original_price: Number(formData.get("original_price")) || undefined,
      currency: String(formData.get("currency") ?? "") || undefined,
      valid_from: String(formData.get("valid_from") ?? "") || undefined,
      valid_to: String(formData.get("valid_to") ?? "") || undefined,
    };
    setData((prev) => ({ ...prev, pricing: [...(prev.pricing || []), item] }));
    markDirty();
  };
  const updatePricing = async (formData: FormData) => {
    const pricingId = String(formData.get("pricingId"));
    setData((prev) => ({
      ...prev,
      pricing: (prev.pricing || []).map((p) =>
        (p as Record<string, unknown>).id === pricingId
          ? {
              ...p,
              room_name: String(formData.get("room_name") ?? ""),
              base_rate: Number(formData.get("base_rate") ?? 0),
              discounted_rate: Number(formData.get("discounted_rate")) || undefined,
              original_price: Number(formData.get("original_price")) || undefined,
              currency: String(formData.get("currency") ?? "") || undefined,
              valid_from: String(formData.get("valid_from") ?? "") || undefined,
              valid_to: String(formData.get("valid_to") ?? "") || undefined,
            }
          : p,
      ),
    }));
    markDirty();
  };
  const deletePricing = async (formData: FormData) => {
    const pricingId = String(formData.get("pricingId"));
    setData((prev) => ({
      ...prev,
      pricing: (prev.pricing || []).filter(
        (p) => (p as Record<string, unknown>).id !== pricingId,
      ),
    }));
    markDirty();
  };

  // Attractions & Proximity
  const attractions = withIds(data.nearby_attractions || []);
  const proximity = withIds(data.proximity_info || []);
  const createAttraction = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "") || undefined,
      distance: Number(formData.get("distance")) || undefined,
      distance_unit: String(formData.get("distance_unit") ?? "km") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
    };
    setData((prev) => ({
      ...prev,
      nearby_attractions: [...(prev.nearby_attractions || []), item],
    }));
    markDirty();
  };
  const updateAttraction = async (formData: FormData) => {
    const id = String(formData.get("attractionId"));
    setData((prev) => ({
      ...prev,
      nearby_attractions: (prev.nearby_attractions || []).map((a) =>
        (a as Record<string, unknown>).id === id
          ? {
              ...a,
              name: String(formData.get("name") ?? ""),
              type: String(formData.get("type") ?? "") || undefined,
              distance: Number(formData.get("distance")) || undefined,
              distance_unit: String(formData.get("distance_unit") ?? "km") || undefined,
              description: String(formData.get("description") ?? "") || undefined,
            }
          : a,
      ),
    }));
    markDirty();
  };
  const deleteAttraction = async (formData: FormData) => {
    const id = String(formData.get("attractionId"));
    setData((prev) => ({
      ...prev,
      nearby_attractions: (prev.nearby_attractions || []).filter(
        (a) => (a as Record<string, unknown>).id !== id,
      ),
    }));
    markDirty();
  };
  const createProximity = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      point_of_interest: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      distance: Number(formData.get("distance")) || undefined,
      distance_unit: String(formData.get("distance_unit") ?? "km") || undefined,
    };
    setData((prev) => ({
      ...prev,
      proximity_info: [...(prev.proximity_info || []), item],
    }));
    markDirty();
  };
  const updateProximity = async (formData: FormData) => {
    const id = String(formData.get("proximityId"));
    setData((prev) => ({
      ...prev,
      proximity_info: (prev.proximity_info || []).map((p) =>
        (p as Record<string, unknown>).id === id
          ? {
              ...p,
              point_of_interest: String(formData.get("name") ?? ""),
              description: String(formData.get("description") ?? ""),
              distance: Number(formData.get("distance")) || undefined,
              distance_unit: String(formData.get("distance_unit") ?? "km") || undefined,
            }
          : p,
      ),
    }));
    markDirty();
  };
  const deleteProximity = async (formData: FormData) => {
    const id = String(formData.get("proximityId"));
    setData((prev) => ({
      ...prev,
      proximity_info: (prev.proximity_info || []).filter(
        (p) => (p as Record<string, unknown>).id !== id,
      ),
    }));
    markDirty();
  };

  // Rules
  const rules = withIds(data.rules_and_policies || []);
  const createRule = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      rule_type: String(formData.get("rule_type") ?? "house_rules") as "house_rules",
      rule_text: String(formData.get("rule_text") ?? ""),
      display_order: Number(formData.get("display_order")) || 0,
    };
    setData((prev) => ({
      ...prev,
      rules_and_policies: [...(prev.rules_and_policies || []), item],
    }));
    markDirty();
  };
  const updateRule = async (formData: FormData) => {
    const ruleId = String(formData.get("ruleId"));
    setData((prev) => ({
      ...prev,
      rules_and_policies: (prev.rules_and_policies || []).map((r) =>
        (r as Record<string, unknown>).id === ruleId
          ? {
              ...r,
              rule_type: String(formData.get("rule_type") ?? "house_rules") as "house_rules",
              rule_text: String(formData.get("rule_text") ?? ""),
              display_order: Number(formData.get("display_order")) || 0,
            }
          : r,
      ),
    }));
    markDirty();
  };
  const deleteRule = async (ruleId: string) => {
    setData((prev) => ({
      ...prev,
      rules_and_policies: (prev.rules_and_policies || []).filter(
        (r) => (r as Record<string, unknown>).id !== ruleId,
      ),
    }));
    markDirty();
  };

  // Promotions / Special Offers
  const offers = withIds(data.special_offers || []);
  const createOffer = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      offer_type: String(formData.get("offer_type") ?? "package") as "package",
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
      discount_percentage: Number(formData.get("discount_percentage")) || undefined,
      discount_amount: Number(formData.get("discount_amount")) || undefined,
      valid_from: String(formData.get("valid_from") ?? "") || undefined,
      valid_to: String(formData.get("valid_to") ?? "") || undefined,
    };
    setData((prev) => ({
      ...prev,
      special_offers: [...(prev.special_offers || []), item],
    }));
    markDirty();
  };
  const updateOffer = async (formData: FormData) => {
    const offerId = String(formData.get("offerId"));
    setData((prev) => ({
      ...prev,
      special_offers: (prev.special_offers || []).map((o) =>
        (o as Record<string, unknown>).id === offerId
          ? {
              ...o,
              offer_type: String(formData.get("offer_type") ?? "package") as "package",
              title: String(formData.get("title") ?? ""),
              description: String(formData.get("description") ?? "") || undefined,
              discount_percentage: Number(formData.get("discount_percentage")) || undefined,
              discount_amount: Number(formData.get("discount_amount")) || undefined,
              valid_from: String(formData.get("valid_from") ?? "") || undefined,
              valid_to: String(formData.get("valid_to") ?? "") || undefined,
            }
          : o,
      ),
    }));
    markDirty();
  };
  const deleteOffer = async (formData: FormData) => {
    const offerId = String(formData.get("offerId"));
    setData((prev) => ({
      ...prev,
      special_offers: (prev.special_offers || []).filter(
        (o) => (o as Record<string, unknown>).id !== offerId,
      ),
    }));
    markDirty();
  };

  // Additional (features, social links, payment methods, CTAs)
  const features = withIds(data.property_features || []);
  const socialLinks = withIds(data.social_media_links || []);
  const paymentMethods = withIds(data.payment_methods || []);
  const ctas = withIds(data.booking_ctas || []);

  const createFeature = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      feature_type: String(formData.get("feature_type") ?? ""),
      description: String(formData.get("description") ?? ""),
      display_order: Number(formData.get("display_order")) || 0,
    };
    setData((prev) => ({ ...prev, property_features: [...(prev.property_features || []), item] }));
    markDirty();
  };
  const updateFeature = async (formData: FormData) => {
    const id = String(formData.get("featureId"));
    setData((prev) => ({
      ...prev,
      property_features: (prev.property_features || []).map((f) =>
        (f as Record<string, unknown>).id === id
          ? {
              ...f,
              feature_type: String(formData.get("feature_type") ?? ""),
              description: String(formData.get("description") ?? ""),
              display_order: Number(formData.get("display_order")) || 0,
            }
          : f,
      ),
    }));
    markDirty();
  };
  const deleteFeature = async (formData: FormData) => {
    const id = String(formData.get("featureId"));
    setData((prev) => ({
      ...prev,
      property_features: (prev.property_features || []).filter(
        (f) => (f as Record<string, unknown>).id !== id,
      ),
    }));
    markDirty();
  };
  const createSocialLink = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      platform: String(formData.get("platform") ?? ""),
      url: String(formData.get("url") ?? ""),
    };
    setData((prev) => ({ ...prev, social_media_links: [...(prev.social_media_links || []), item] }));
    markDirty();
  };
  const updateSocialLink = async (formData: FormData) => {
    const id = String(formData.get("socialLinkId"));
    setData((prev) => ({
      ...prev,
      social_media_links: (prev.social_media_links || []).map((l) =>
        (l as Record<string, unknown>).id === id
          ? { ...l, platform: String(formData.get("platform") ?? ""), url: String(formData.get("url") ?? "") }
          : l,
      ),
    }));
    markDirty();
  };
  const deleteSocialLink = async (formData: FormData) => {
    const id = String(formData.get("socialLinkId"));
    setData((prev) => ({
      ...prev,
      social_media_links: (prev.social_media_links || []).filter(
        (l) => (l as Record<string, unknown>).id !== id,
      ),
    }));
    markDirty();
  };
  const createPaymentMethod = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      payment_type: String(formData.get("payment_type") ?? ""),
      is_available: formData.get("is_available") !== "off",
    };
    setData((prev) => ({ ...prev, payment_methods: [...(prev.payment_methods || []), item] }));
    markDirty();
  };
  const updatePaymentMethod = async (formData: FormData) => {
    const id = String(formData.get("paymentMethodId"));
    setData((prev) => ({
      ...prev,
      payment_methods: (prev.payment_methods || []).map((m) =>
        (m as Record<string, unknown>).id === id
          ? { ...m, payment_type: String(formData.get("payment_type") ?? ""), is_available: formData.get("is_available") !== "off" }
          : m,
      ),
    }));
    markDirty();
  };
  const deletePaymentMethod = async (formData: FormData) => {
    const id = String(formData.get("paymentMethodId"));
    setData((prev) => ({
      ...prev,
      payment_methods: (prev.payment_methods || []).filter(
        (m) => (m as Record<string, unknown>).id !== id,
      ),
    }));
    markDirty();
  };
  const createCta = async (formData: FormData) => {
    const item = {
      id: crypto.randomUUID(),
      cta_type: String(formData.get("cta_type") ?? "book_now") as "book_now",
      label: String(formData.get("label") ?? ""),
      url: String(formData.get("url") ?? "") || undefined,
      phone_number: String(formData.get("phone_number") ?? "") || undefined,
      is_active: formData.get("is_active") !== "off",
      display_order: Number(formData.get("display_order")) || 0,
    };
    setData((prev) => ({ ...prev, booking_ctas: [...(prev.booking_ctas || []), item] }));
    markDirty();
  };
  const updateCta = async (formData: FormData) => {
    const id = String(formData.get("ctaId"));
    setData((prev) => ({
      ...prev,
      booking_ctas: (prev.booking_ctas || []).map((c) =>
        (c as Record<string, unknown>).id === id
          ? {
              ...c,
              cta_type: String(formData.get("cta_type") ?? "book_now") as "book_now",
              label: String(formData.get("label") ?? ""),
              url: String(formData.get("url") ?? "") || undefined,
              phone_number: String(formData.get("phone_number") ?? "") || undefined,
              is_active: formData.get("is_active") !== "off",
              display_order: Number(formData.get("display_order")) || 0,
            }
          : c,
      ),
    }));
    markDirty();
  };
  const deleteCta = async (formData: FormData) => {
    const id = String(formData.get("ctaId"));
    setData((prev) => ({
      ...prev,
      booking_ctas: (prev.booking_ctas || []).filter(
        (c) => (c as Record<string, unknown>).id !== id,
      ),
    }));
    markDirty();
  };

  function renderTab() {
    switch (activeTab) {
      case "basic":
        return (
          <DiscoveryBasicInfo
            property={data.property}
            onChange={(property) => {
              setData((prev) => ({ ...prev, property }));
              markDirty();
            }}
            disabled={isImported}
            errorPaths={errorPaths}
          />
        );
      case "rooms":
        return (
          <RoomsManager
            rooms={rooms as any}
            bedsMap={{}}
            roomAmenitiesMap={{}}
            roomScopeAmenities={[]}
            propertyId=""
            tenantId=""
            createRoom={createRoom}
            updateRoom={updateRoom}
            deleteRoom={deleteRoom}
            addBed={addBed}
            deleteBed={deleteBed}
            updateRoomAmenities={updateRoomAmenities}
          />
        );
      case "images":
        return (
          <DiscoveryImages
            jobId={jobId}
            images={data.images || []}
            rooms={(data.rooms || []).map((r) => ({ name: r.name }))}
            onChange={(images: NonNullable<typeof data.images>) => {
              setData((prev) => ({ ...prev, images }));
              markDirty();
            }}
            disabled={isImported}
          />
        );
      case "pricing":
        return (
          <PricingManager
            propertyId=""
            tenantId=""
            rooms={pricingRooms as any}
            pricing={pricing as any}
            createPricing={createPricing}
            updatePricing={updatePricing}
            deletePricing={deletePricing}
          />
        );
      case "booking":
        return (
          <DiscoveryBooking
            settings={data.booking_settings || { deposit_required: false }}
            onChange={(settings) => {
              setData((prev) => ({ ...prev, booking_settings: settings }));
              markDirty();
            }}
            disabled={isImported}
          />
        );
      case "amenities":
        return (
          <DiscoveryAmenities
            amenities={data.property_amenities || []}
            tags={data.property_tags || []}
            onChangeAmenities={(amenities) => {
              setData((prev) => ({ ...prev, property_amenities: amenities }));
              markDirty();
            }}
            onChangeTags={(tags) => {
              setData((prev) => ({ ...prev, property_tags: tags }));
              markDirty();
            }}
            disabled={isImported}
          />
        );
      case "hosts":
        return (
          <HostsManager
            hosts={hosts as any}
            createHost={createHost}
            updateHost={updateHost}
            deleteHost={deleteHost}
          />
        );
      case "reviews":
        return (
          <ReviewsManager
            reviews={reviews as any}
            createReview={createReview}
            updateReview={updateReview}
            deleteReview={deleteReview}
          />
        );
      case "rules":
        return (
          <RulesManager
            propertyId=""
            tenantId=""
            rules={rules as any}
            createRule={createRule}
            updateRule={updateRule}
            deleteRule={deleteRule}
          />
        );
      case "attractions":
        return (
          <AttractionsManager
            propertyId=""
            tenantId=""
            attractions={attractions as any}
            proximity={proximity as any}
            createAttraction={createAttraction}
            createProximity={createProximity}
            updateAttraction={updateAttraction}
            updateProximity={updateProximity}
            deleteAttraction={deleteAttraction}
            deleteProximity={deleteProximity}
          />
        );
      case "promotions":
        return (
          <PromotionsManager
            propertyId=""
            tenantId=""
            rooms={pricingRooms as any}
            offers={offers as any}
            createOffer={createOffer}
            updateOffer={updateOffer}
            deleteOffer={deleteOffer}
          />
        );
      case "vision-debug":
        return <DiscoveryVisionDebug jobId={jobId} />;
      case "additional":
        return (
          <AdditionalManager
            propertyId=""
            tenantId=""
            features={features as any}
            socialLinks={socialLinks as any}
            paymentMethods={paymentMethods as any}
            ctas={ctas as any}
            createFeature={createFeature}
            updateFeature={updateFeature}
            deleteFeature={deleteFeature}
            createSocialLink={createSocialLink}
            updateSocialLink={updateSocialLink}
            deleteSocialLink={deleteSocialLink}
            createPaymentMethod={createPaymentMethod}
            updatePaymentMethod={updatePaymentMethod}
            deletePaymentMethod={deletePaymentMethod}
            createCTA={createCta}
            updateCTA={updateCta}
            deleteCTA={deleteCta}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div>
      {isImported && (
        <div className="mb-4 rounded-md bg-purple-50 border border-purple-200 p-3 text-sm text-purple-800">
          This discovery was imported on{" "}
          {new Date(jobMeta.importedAt!).toLocaleDateString()}. It is now read-only.
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {data.property.name || "Untitled Discovery"}
        </h1>
        <div className="flex items-center gap-3">
          {!isImported && (
            <>
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : dirty ? "Save" : "Saved"}
              </button>
              <button
                onClick={handleValidate}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Validate
              </button>
              {validated && validationResult?.valid ? (
                <button
                  onClick={() => setImportDialogOpen(true)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Import to Tenant
                </button>
              ) : (
                <button
                  disabled
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
                  title={validated ? "Fix validation errors first" : "Click Validate first"}
                >
                  Import to Tenant
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <DiscoveryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        errorsByTab={validationResult?.errorsByTab}
        validated={validated}
      />

      {validated && validationResult?.errorsByTab[activeTab] && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800 mb-1">
            {validationResult.errorsByTab[activeTab].length} validation error(s):
          </p>
          <ul className="list-disc pl-5 text-sm text-red-700 space-y-0.5">
            {validationResult.errorsByTab[activeTab].map((err, i) => (
              <li key={i}>
                <span className="font-mono text-xs">{err.path}</span>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">{renderTab()}</div>

      {importDialogOpen && (
        <ImportToTenantDialog
          jobId={jobId}
          tenants={tenants}
          images={data.images || []}
          propertyData={data}
          onClose={() => setImportDialogOpen(false)}
          onImported={() => router.refresh()}
        />
      )}
    </div>
  );
}
