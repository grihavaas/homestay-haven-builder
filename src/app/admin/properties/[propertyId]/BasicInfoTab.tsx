import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function BasicInfoTab({ property }: { property: any }) {
  async function save(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      type: String(formData.get("type") ?? "").trim() || null,
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      room_section_header: String(formData.get("room_section_header") ?? "").trim() || null,
      room_section_tagline: String(formData.get("room_section_tagline") ?? "").trim() || null,
      classification: String(formData.get("classification") ?? "").trim() || null,
      street_address: String(formData.get("street_address") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      state: String(formData.get("state") ?? "").trim() || null,
      country: String(formData.get("country") ?? "").trim(),
      postal_code: String(formData.get("postal_code") ?? "").trim() || null,
      location_description:
        String(formData.get("location_description") ?? "").trim() || null,
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
      is_published: Boolean(formData.get("is_published")),
      is_active: Boolean(formData.get("is_active")),
      feature_seo_elements: Boolean(formData.get("feature_seo_elements")),
    };

    if (!payload.name || !payload.country) return;

    const { error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", property.id);
    if (error) throw error;

    revalidatePath(`/admin/properties/${property.id}`);
    revalidatePath("/");
  }

  return (
    <form action={save} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Name</div>
          <input
            name="name"
            defaultValue={property.name}
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Type</div>
          <select
            name="type"
            defaultValue={property.type ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="">Select type</option>
            <option value="Hotel">Hotel</option>
            <option value="Resort">Resort</option>
            <option value="Homestay">Homestay</option>
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
            <option value="Guest House">Guest House</option>
            <option value="Bed & Breakfast">Bed & Breakfast</option>
            <option value="Inn">Inn</option>
            <option value="Lodge">Lodge</option>
            <option value="Cottage">Cottage</option>
            <option value="Cabin">Cabin</option>
            <option value="Boutique Hotel">Boutique Hotel</option>
            <option value="Heritage Hotel">Heritage Hotel</option>
          </select>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">Tagline</div>
        <input
          name="tagline"
          defaultValue={property.tagline ?? ""}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Description</div>
        <textarea
          name="description"
          defaultValue={property.description ?? ""}
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={6}
        />
      </label>

      <div className="rounded-md border p-4 space-y-4 bg-zinc-50">
        <h3 className="text-sm font-semibold">Rooms Section</h3>
        <label className="block">
          <div className="text-sm font-medium">Room Section Header</div>
          <input
            name="room_section_header"
            defaultValue={property.room_section_header ?? ""}
            placeholder="e.g., Base Camps, Mountain Lodges"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Main heading for the rooms section (appears below "Accommodations" label)
          </p>
        </label>
        <label className="block">
          <div className="text-sm font-medium">Room Section Tagline</div>
          <input
            name="room_section_tagline"
            defaultValue={property.room_section_tagline ?? ""}
            placeholder="e.g., Your Adventure Headquarters, Coastal Comfort"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Subtitle/description for the rooms section (appears below the header)
          </p>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Classification</div>
          <select
            name="classification"
            defaultValue={property.classification ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="">Select classification</option>
            <option value="1 Star">1 Star</option>
            <option value="2 Star">2 Star</option>
            <option value="3 Star">3 Star</option>
            <option value="4 Star">4 Star</option>
            <option value="5 Star">5 Star</option>
            <option value="Luxury">Luxury</option>
            <option value="Boutique">Boutique</option>
            <option value="Budget">Budget</option>
            <option value="Economy">Economy</option>
            <option value="Mid-Range">Mid-Range</option>
            <option value="Upscale">Upscale</option>
          </select>
        </label>
        <label className="block">
          <div className="text-sm font-medium">Street address</div>
          <input
            name="street_address"
            defaultValue={property.street_address ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <div className="text-sm font-medium">City</div>
          <input
            name="city"
            defaultValue={property.city ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">State</div>
          <input
            name="state"
            defaultValue={property.state ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Country</div>
          <select
            name="country"
            defaultValue={property.country ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          >
            <option value="">Select country</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Italy">Italy</option>
            <option value="Spain">Spain</option>
            <option value="Portugal">Portugal</option>
            <option value="Greece">Greece</option>
            <option value="Thailand">Thailand</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Singapore">Singapore</option>
            <option value="Japan">Japan</option>
            <option value="South Korea">South Korea</option>
            <option value="China">China</option>
            <option value="Brazil">Brazil</option>
            <option value="Mexico">Mexico</option>
            <option value="Argentina">Argentina</option>
            <option value="South Africa">South Africa</option>
            <option value="Egypt">Egypt</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Turkey">Turkey</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Postal code</div>
          <input
            name="postal_code"
            defaultValue={property.postal_code ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Location description</div>
          <input
            name="location_description"
            defaultValue={property.location_description ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Latitude</div>
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={property.latitude ?? ""}
            placeholder="e.g., 28.6139"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Decimal degrees (e.g., 28.6139 for New Delhi)
          </p>
        </label>
        <label className="block">
          <div className="text-sm font-medium">Longitude</div>
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={property.longitude ?? ""}
            placeholder="e.g., 77.2090"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Decimal degrees (e.g., 77.2090 for New Delhi)
          </p>
        </label>
      </div>

      <div className="flex flex-wrap gap-6 rounded-md border p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={property.is_active}
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            name="is_published"
            type="checkbox"
            defaultChecked={property.is_published}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            name="feature_seo_elements"
            type="checkbox"
            defaultChecked={property.feature_seo_elements || false}
          />
          Enable Advanced SEO Elements
        </label>
      </div>

      <button className="rounded-md bg-black px-4 py-2 text-white">
        Save
      </button>
    </form>
  );
}
