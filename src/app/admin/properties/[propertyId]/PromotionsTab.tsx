import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PromotionsManager } from "./PromotionsManager";

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

async function listOffers(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("special_offers")
    .select(
      "id,room_id,offer_type,title,description,discount_percentage,discount_amount,valid_from,valid_to,is_active",
    )
    .eq("property_id", propertyId)
    .order("valid_from", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function getProperty(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("feature_dynamic_content")
    .eq("id", propertyId)
    .single();
  if (error) throw error;
  return data;
}

export async function PromotionsTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const [rooms, offers, property] = await Promise.all([
    listRooms(propertyId),
    listOffers(propertyId),
    getProperty(propertyId),
  ]);

  async function createOffer(formData: FormData) {
    "use server";
    const offerType = String(formData.get("offer_type") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    if (!offerType || !title) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("special_offers").insert({
      property_id: propertyId,
      room_id: String(formData.get("room_id") ?? "").trim() || null,
      tenant_id: tenantId,
      offer_type: offerType,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      discount_percentage: Number(formData.get("discount_percentage")) || null,
      discount_amount: Number(formData.get("discount_amount")) || null,
      valid_from: String(formData.get("valid_from") ?? "").trim() || null,
      valid_to: String(formData.get("valid_to") ?? "").trim() || null,
      is_active: Boolean(formData.get("is_active")),
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateOffer(formData: FormData) {
    "use server";
    const offerId = String(formData.get("offerId"));
    const offerType = String(formData.get("offer_type") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    if (!offerType || !title) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("special_offers")
      .update({
        room_id: String(formData.get("room_id") ?? "").trim() || null,
        offer_type: offerType,
        title,
        description: String(formData.get("description") ?? "").trim() || null,
        discount_percentage: Number(formData.get("discount_percentage")) || null,
        discount_amount: Number(formData.get("discount_amount")) || null,
        valid_from: String(formData.get("valid_from") ?? "").trim() || null,
        valid_to: String(formData.get("valid_to") ?? "").trim() || null,
        is_active: Boolean(formData.get("is_active")),
      })
      .eq("id", offerId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteOffer(formData: FormData) {
    "use server";
    const offerId = String(formData.get("offerId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("special_offers").delete().eq("id", offerId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateFeatureFlag(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("properties")
      .update({
        feature_dynamic_content: Boolean(formData.get("feature_dynamic_content")),
      })
      .eq("id", propertyId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <div>
      <div className="mt-6 rounded-lg border p-4 mb-6">
        <h3 className="font-medium mb-3">Feature Settings</h3>
        <form action={updateFeatureFlag}>
          <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-zinc-50 cursor-pointer">
            <input
              type="checkbox"
              name="feature_dynamic_content"
              defaultChecked={property.feature_dynamic_content || false}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">Enable Dynamic Content</div>
              <div className="text-sm text-zinc-600">
                Enable dynamic content features (availability calendar, pricing updates, promotional banners) on the public website
              </div>
            </div>
            <button
              type="submit"
              className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-3 py-1 rounded"
            >
              Save
            </button>
          </label>
        </form>
      </div>

      <PromotionsManager
        propertyId={propertyId}
        tenantId={tenantId}
        rooms={rooms}
        offers={offers}
        createOffer={createOffer}
        updateOffer={updateOffer}
        deleteOffer={deleteOffer}
      />
    </div>
  );
}
