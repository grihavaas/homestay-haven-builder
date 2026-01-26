import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AttractionsManager } from "./AttractionsManager";

async function listAttractions(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("nearby_attractions")
    .select("id,name,type,distance,distance_unit,description,transportation_info,display_order")
    .eq("property_id", propertyId)
    .order("display_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listProximity(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proximity_info")
    .select("id,point_of_interest,distance,distance_unit,description")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function getProperty(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("feature_nearby_attractions")
    .eq("id", propertyId)
    .single();
  if (error) throw error;
  return data;
}

export async function AttractionsTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const [attractions, proximity, property] = await Promise.all([
    listAttractions(propertyId),
    listProximity(propertyId),
    getProperty(propertyId),
  ]);

  async function updateFeatureFlag(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("properties")
      .update({
        feature_nearby_attractions: Boolean(formData.get("feature_nearby_attractions")),
      })
      .eq("id", propertyId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function createAttraction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("nearby_attractions").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      name,
      type: String(formData.get("type") ?? "").trim() || null,
      distance: Number(formData.get("distance")) || null,
      distance_unit: String(formData.get("distance_unit") ?? "km").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      transportation_info: String(formData.get("transportation_info") ?? "").trim() || null,
      display_order: Number(formData.get("display_order")) || 0,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function createProximity(formData: FormData) {
    "use server";
    const poi = String(formData.get("point_of_interest") ?? "").trim();
    if (!poi) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("proximity_info").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      point_of_interest: poi,
      distance: Number(formData.get("distance")) || null,
      distance_unit: String(formData.get("distance_unit") ?? "km").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteAttraction(formData: FormData) {
    "use server";
    const attractionId = String(formData.get("attractionId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("nearby_attractions")
      .delete()
      .eq("id", attractionId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteProximity(formData: FormData) {
    "use server";
    const proximityId = String(formData.get("proximityId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("proximity_info")
      .delete()
      .eq("id", proximityId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateAttraction(formData: FormData) {
    "use server";
    const attractionId = String(formData.get("attractionId"));
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("nearby_attractions")
      .update({
        name,
        type: String(formData.get("type") ?? "").trim() || null,
        distance: Number(formData.get("distance")) || null,
        distance_unit: String(formData.get("distance_unit") ?? "km").trim(),
        description: String(formData.get("description") ?? "").trim() || null,
        transportation_info: String(formData.get("transportation_info") ?? "").trim() || null,
        display_order: Number(formData.get("display_order")) || 0,
      })
      .eq("id", attractionId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateProximity(formData: FormData) {
    "use server";
    const proximityId = String(formData.get("proximityId"));
    const poi = String(formData.get("point_of_interest") ?? "").trim();
    if (!poi) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("proximity_info")
      .update({
        point_of_interest: poi,
        distance: Number(formData.get("distance")) || null,
        distance_unit: String(formData.get("distance_unit") ?? "km").trim(),
        description: String(formData.get("description") ?? "").trim() || null,
      })
      .eq("id", proximityId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h3 className="font-medium mb-3">Feature Settings</h3>
        <form action={updateFeatureFlag}>
          <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-zinc-50 cursor-pointer">
            <input
              type="checkbox"
              name="feature_nearby_attractions"
              defaultChecked={property.feature_nearby_attractions || false}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">Show Nearby Attractions on Website</div>
              <div className="text-sm text-zinc-600">
                Enable this to display the nearby attractions section on the public website
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

      <AttractionsManager
        propertyId={propertyId}
        tenantId={tenantId}
        attractions={attractions}
        proximity={proximity}
        createAttraction={createAttraction}
        createProximity={createProximity}
        updateAttraction={updateAttraction}
        updateProximity={updateProximity}
        deleteAttraction={deleteAttraction}
        deleteProximity={deleteProximity}
      />
    </div>
  );
}
