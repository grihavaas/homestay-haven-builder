import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/SubmitButton";

export async function SeoTab({ property }: { property: any }) {
  async function save(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("properties")
      .update({
        meta_title: String(formData.get("meta_title") ?? "").trim() || null,
        meta_description: String(formData.get("meta_description") ?? "").trim() || null,
        meta_keywords: String(formData.get("meta_keywords") ?? "").trim() || null,
        og_title: String(formData.get("og_title") ?? "").trim() || null,
        og_description: String(formData.get("og_description") ?? "").trim() || null,
        og_image_url: String(formData.get("og_image_url") ?? "").trim() || null,
      })
      .eq("id", property.id);
    if (error) throw error;
    revalidatePath(`/admin/properties/${property.id}`);
    revalidatePath("/");
  }

  return (
    <form action={save} className="space-y-6 max-w-2xl">
      <div className="rounded-md border p-4 space-y-4 bg-zinc-50">
        <div>
          <h3 className="text-sm font-semibold">Page Metadata</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Overrides the default title and description used in search results. Leave blank to use property name/description.
          </p>
        </div>

        <label className="block">
          <div className="text-sm font-medium">
            Meta Title
            <span className="ml-2 text-xs font-normal text-zinc-400">recommended ≤ 60 chars</span>
          </div>
          <input
            name="meta_title"
            defaultValue={property.meta_title ?? ""}
            maxLength={80}
            placeholder={property.tagline ? `${property.name} | ${property.tagline}` : property.name}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Appears as the clickable headline in Google search results.
          </p>
        </label>

        <label className="block">
          <div className="text-sm font-medium">
            Meta Description
            <span className="ml-2 text-xs font-normal text-zinc-400">recommended ≤ 160 chars</span>
          </div>
          <textarea
            name="meta_description"
            defaultValue={property.meta_description ?? ""}
            maxLength={200}
            rows={3}
            placeholder={property.description ? property.description.substring(0, 160) : `Book your stay at ${property.name}`}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-zinc-500">
            The snippet shown under the title in search results.
          </p>
        </label>

        <label className="block">
          <div className="text-sm font-medium">
            Meta Keywords
            <span className="ml-2 text-xs font-normal text-zinc-400">comma-separated</span>
          </div>
          <input
            name="meta_keywords"
            defaultValue={property.meta_keywords ?? ""}
            placeholder="homestay, Kerala, riverside, nature stay"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Not used by Google but may help with other search engines and internal search.
          </p>
        </label>
      </div>

      <div className="rounded-md border p-4 space-y-4 bg-zinc-50">
        <div>
          <h3 className="text-sm font-semibold">Social / OG Tags</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Controls how the page appears when shared on WhatsApp, Facebook, Twitter, etc. Falls back to Meta Title/Description if blank.
          </p>
        </div>

        <label className="block">
          <div className="text-sm font-medium">OG Title</div>
          <input
            name="og_title"
            defaultValue={property.og_title ?? ""}
            maxLength={100}
            placeholder={property.name}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">OG Description</div>
          <textarea
            name="og_description"
            defaultValue={property.og_description ?? ""}
            maxLength={200}
            rows={3}
            placeholder={property.description?.substring(0, 160) ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">OG Image URL</div>
          <input
            name="og_image_url"
            type="url"
            defaultValue={property.og_image_url ?? ""}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono text-xs"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Image shown in social previews and Google rich results. Recommended: 1200×630px. Use a Supabase media URL from the Media tab.
          </p>
          {property.og_image_url && (
            <img
              src={property.og_image_url}
              alt="OG preview"
              className="mt-2 rounded-md border object-cover"
              style={{ maxHeight: 160, maxWidth: 300 }}
            />
          )}
        </label>
      </div>

      <SubmitButton pendingText="Saving...">Save SEO Settings</SubmitButton>
    </form>
  );
}
