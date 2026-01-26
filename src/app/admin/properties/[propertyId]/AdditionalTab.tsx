import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdditionalManager } from "./AdditionalManager";

async function listFeatures(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("property_features")
    .select("id,feature_type,description,display_order")
    .eq("property_id", propertyId)
    .order("display_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listSocialLinks(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("social_media_links")
    .select("id,platform,url")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listPaymentMethods(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("id,payment_type,is_available")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listCTAs(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("booking_ctas")
    .select("id,cta_type,label,url,phone_number,is_active,display_order")
    .eq("property_id", propertyId)
    .order("display_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function getProperty(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("feature_property_features,feature_additional_info")
    .eq("id", propertyId)
    .single();
  if (error) throw error;
  return data;
}

export async function AdditionalTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const [features, socialLinks, paymentMethods, ctas, property] = await Promise.all([
    listFeatures(propertyId),
    listSocialLinks(propertyId),
    listPaymentMethods(propertyId),
    listCTAs(propertyId),
    getProperty(propertyId),
  ]);

  async function updateFeatureFlags(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("properties")
      .update({
        feature_property_features: Boolean(formData.get("feature_property_features")),
        feature_additional_info: Boolean(formData.get("feature_additional_info")),
      })
      .eq("id", propertyId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function createFeature(formData: FormData) {
    "use server";
    const featureType = String(formData.get("feature_type") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!featureType || !description) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("property_features").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      feature_type: featureType,
      description,
      display_order: Number(formData.get("display_order")) || 0,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function createSocialLink(formData: FormData) {
    "use server";
    const platform = String(formData.get("platform") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();
    if (!platform || !url) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("social_media_links").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      platform,
      url,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function createPaymentMethod(formData: FormData) {
    "use server";
    const paymentType = String(formData.get("payment_type") ?? "").trim();
    if (!paymentType) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("payment_methods").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      payment_type: paymentType,
      is_available: Boolean(formData.get("is_available")),
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function createCTA(formData: FormData) {
    "use server";
    const ctaType = String(formData.get("cta_type") ?? "").trim();
    const label = String(formData.get("label") ?? "").trim();
    if (!ctaType || !label) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("booking_ctas").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      cta_type: ctaType,
      label,
      url: String(formData.get("url") ?? "").trim() || null,
      phone_number: String(formData.get("phone_number") ?? "").trim() || null,
      is_active: Boolean(formData.get("is_active")),
      display_order: Number(formData.get("display_order")) || 0,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteFeature(formData: FormData) {
    "use server";
    const featureId = String(formData.get("featureId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("property_features")
      .delete()
      .eq("id", featureId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteSocialLink(formData: FormData) {
    "use server";
    const linkId = String(formData.get("linkId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("social_media_links")
      .delete()
      .eq("id", linkId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deletePaymentMethod(formData: FormData) {
    "use server";
    const methodId = String(formData.get("methodId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", methodId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateFeature(formData: FormData) {
    "use server";
    const featureId = String(formData.get("featureId"));
    const featureType = String(formData.get("feature_type") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!featureType || !description) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("property_features")
      .update({
        feature_type: featureType,
        description,
        display_order: Number(formData.get("display_order")) || 0,
      })
      .eq("id", featureId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateSocialLink(formData: FormData) {
    "use server";
    const linkId = String(formData.get("linkId"));
    const platform = String(formData.get("platform") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();
    if (!platform || !url) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("social_media_links")
      .update({
        platform,
        url,
      })
      .eq("id", linkId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updatePaymentMethod(formData: FormData) {
    "use server";
    const methodId = String(formData.get("methodId"));
    const paymentType = String(formData.get("payment_type") ?? "").trim();
    if (!paymentType) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("payment_methods")
      .update({
        payment_type: paymentType,
        is_available: Boolean(formData.get("is_available")),
      })
      .eq("id", methodId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateCTA(formData: FormData) {
    "use server";
    const ctaId = String(formData.get("ctaId"));
    const ctaType = String(formData.get("cta_type") ?? "").trim();
    const label = String(formData.get("label") ?? "").trim();
    if (!ctaType || !label) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("booking_ctas")
      .update({
        cta_type: ctaType,
        label,
        url: String(formData.get("url") ?? "").trim() || null,
        phone_number: String(formData.get("phone_number") ?? "").trim() || null,
        is_active: Boolean(formData.get("is_active")),
        display_order: Number(formData.get("display_order")) || 0,
      })
      .eq("id", ctaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteCTA(formData: FormData) {
    "use server";
    const ctaId = String(formData.get("ctaId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("booking_ctas").delete().eq("id", ctaId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h3 className="font-medium mb-3">Feature Settings</h3>
        <form action={updateFeatureFlags} className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-zinc-50 cursor-pointer">
            <input
              type="checkbox"
              name="feature_property_features"
              defaultChecked={property.feature_property_features || false}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">Show Property Features on Website</div>
              <div className="text-sm text-zinc-600">
                Enable this to display property features (highlights, awards, sustainability) on the public website
              </div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-zinc-50 cursor-pointer">
            <input
              type="checkbox"
              name="feature_additional_info"
              defaultChecked={property.feature_additional_info || false}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">Show Additional Information on Website</div>
              <div className="text-sm text-zinc-600">
                Enable this to display additional information (languages, history, culture, seasonal info, accessibility) on the public website
              </div>
            </div>
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md bg-black px-4 py-2 text-white text-sm"
          >
            Save Feature Settings
          </button>
        </form>
      </div>

      <AdditionalManager
        propertyId={propertyId}
        tenantId={tenantId}
        features={features}
        socialLinks={socialLinks}
        paymentMethods={paymentMethods}
        ctas={ctas}
        createFeature={createFeature}
        createSocialLink={createSocialLink}
        createPaymentMethod={createPaymentMethod}
        createCTA={createCTA}
        updateFeature={updateFeature}
        updateSocialLink={updateSocialLink}
        updatePaymentMethod={updatePaymentMethod}
        updateCTA={updateCTA}
        deleteFeature={deleteFeature}
        deleteSocialLink={deleteSocialLink}
        deletePaymentMethod={deletePaymentMethod}
        deleteCTA={deleteCTA}
      />
    </div>
  );
}
