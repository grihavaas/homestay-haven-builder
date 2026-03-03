import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getStandardAmenities() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("standard_amenities")
    .select("id,name,category")
    .in("amenity_scope", ["property", "both"])
    .order("category")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

async function getStandardTags() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("standard_property_tags")
    .select("id,name,category")
    .order("category")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

async function getPropertyAmenities(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("property_amenities")
    .select("amenity_id")
    .eq("property_id", propertyId);
  if (error) throw error;
  return new Set((data ?? []).map((a) => a.amenity_id));
}

async function getPropertyTags(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("property_tags")
    .select("tag_id")
    .eq("property_id", propertyId);
  if (error) throw error;
  return new Set((data ?? []).map((t) => t.tag_id));
}

export async function AmenitiesTagsTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const [amenities, tags, propertyAmenities, propertyTags] = await Promise.all([
    getStandardAmenities(),
    getStandardTags(),
    getPropertyAmenities(propertyId),
    getPropertyTags(propertyId),
  ]);

  async function updateAmenities(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const selectedAmenities = formData.getAll("amenity") as string[];

    // Delete all existing
    await supabase
      .from("property_amenities")
      .delete()
      .eq("property_id", propertyId);

    // Insert selected
    if (selectedAmenities.length > 0) {
      await supabase.from("property_amenities").insert(
        selectedAmenities.map((amenityId) => ({
          property_id: propertyId,
          amenity_id: amenityId,
        })),
      );
    }

    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateTags(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const selectedTags = formData.getAll("tag") as string[];

    // Delete all existing
    await supabase.from("property_tags").delete().eq("property_id", propertyId);

    // Insert selected
    if (selectedTags.length > 0) {
      await supabase.from("property_tags").insert(
        selectedTags.map((tagId) => ({
          property_id: propertyId,
          tag_id: tagId,
        })),
      );
    }

    revalidatePath(`/admin/properties/${propertyId}`);
  }

  const amenitiesByCategory = amenities.reduce((acc, amenity) => {
    const cat = amenity.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(amenity);
    return acc;
  }, {} as Record<string, typeof amenities>);

  const tagsByCategory = tags.reduce((acc, tag) => {
    const cat = tag.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Property Amenities</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Select amenities available at this property.
        </p>

        <form action={updateAmenities} className="mt-4">
          <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border p-4">
            {Object.entries(amenitiesByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="mb-2 font-medium text-sm">{category}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((amenity) => (
                    <label
                      key={amenity.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="amenity"
                        value={amenity.id}
                        defaultChecked={propertyAmenities.has(amenity.id)}
                      />
                      <span>{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-md bg-black px-4 py-2 text-white">
            Save Amenities
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Property Tags</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Select tags that describe this property.
        </p>

        <form action={updateTags} className="mt-4">
          <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border p-4">
            {Object.entries(tagsByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="mb-2 font-medium text-sm">{category}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="tag"
                        value={tag.id}
                        defaultChecked={propertyTags.has(tag.id)}
                      />
                      <span>{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-md bg-black px-4 py-2 text-white">
            Save Tags
          </button>
        </form>
      </div>
    </div>
  );
}
