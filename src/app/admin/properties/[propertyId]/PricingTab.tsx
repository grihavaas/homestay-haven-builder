import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PricingManager } from "./PricingManager";

async function listRooms(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name")
    .eq("property_id", propertyId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

async function listPricing(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  // First get room IDs
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id")
    .eq("property_id", propertyId);
  
  if (!rooms || rooms.length === 0) return [];
  
  const roomIds = rooms.map((r) => r.id);
  const { data, error } = await supabase
    .from("pricing")
    .select(
      "id,room_id,base_rate,discounted_rate,original_price,currency,valid_from,valid_to,pricing_type",
    )
    .in("room_id", roomIds)
    .order("valid_from", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function PricingTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const [rooms, pricing] = await Promise.all([
    listRooms(propertyId),
    listPricing(propertyId),
  ]);

  async function createPricing(formData: FormData) {
    "use server";
    const roomId = String(formData.get("room_id") ?? "").trim();
    const baseRate = Number(formData.get("base_rate"));
    if (!roomId || !baseRate) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("pricing").insert({
      room_id: roomId,
      tenant_id: tenantId,
      base_rate: baseRate,
      discounted_rate: Number(formData.get("discounted_rate")) || null,
      original_price: Number(formData.get("original_price")) || null,
      currency: String(formData.get("currency") ?? "USD").trim(),
      valid_from: String(formData.get("valid_from") ?? "").trim() || null,
      valid_to: String(formData.get("valid_to") ?? "").trim() || null,
      pricing_type: "per_night", // Always per night
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updatePricing(formData: FormData) {
    "use server";
    const pricingId = String(formData.get("pricingId"));
    const roomId = String(formData.get("room_id") ?? "").trim();
    const baseRate = Number(formData.get("base_rate"));
    if (!roomId || !baseRate) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("pricing")
      .update({
        room_id: roomId,
        base_rate: baseRate,
        discounted_rate: Number(formData.get("discounted_rate")) || null,
        original_price: Number(formData.get("original_price")) || null,
        currency: String(formData.get("currency") ?? "USD").trim(),
        valid_from: String(formData.get("valid_from") ?? "").trim() || null,
        valid_to: String(formData.get("valid_to") ?? "").trim() || null,
        pricing_type: "per_night", // Always per night
      })
      .eq("id", pricingId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deletePricing(formData: FormData) {
    "use server";
    const pricingId = String(formData.get("pricingId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("pricing").delete().eq("id", pricingId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <PricingManager
      propertyId={propertyId}
      tenantId={tenantId}
      rooms={rooms}
      pricing={pricing}
      createPricing={createPricing}
      updatePricing={updatePricing}
      deletePricing={deletePricing}
    />
  );
}
