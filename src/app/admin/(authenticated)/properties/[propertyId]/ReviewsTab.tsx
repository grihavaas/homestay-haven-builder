import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReviewsManager } from "./ReviewsManager";

async function listReviewSources(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("review_sources")
    .select("id,site_name,stars,total_reviews,review_url,display_order")
    .eq("property_id", propertyId)
    .order("display_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function ReviewsTab({
  propertyId,
  tenantId,
  reviewSummary,
}: {
  propertyId: string;
  tenantId: string;
  reviewSummary?: string | null;
}) {
  const reviews = await listReviewSources(propertyId);

  async function createReview(formData: FormData) {
    "use server";
    const siteName = String(formData.get("site_name") ?? "").trim();
    if (!siteName) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("review_sources").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      site_name: siteName,
      stars: Number(formData.get("stars")) || null,
      total_reviews: Number(formData.get("total_reviews")) || 0,
      review_url: String(formData.get("review_url") ?? "").trim() || null,
      display_order: Number(formData.get("display_order")) || 0,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateReview(formData: FormData) {
    "use server";
    const reviewId = String(formData.get("reviewId"));
    const siteName = String(formData.get("site_name") ?? "").trim();
    if (!siteName) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("review_sources")
      .update({
        site_name: siteName,
        stars: Number(formData.get("stars")) || null,
        total_reviews: Number(formData.get("total_reviews")) || 0,
        review_url: String(formData.get("review_url") ?? "").trim() || null,
        display_order: Number(formData.get("display_order")) || 0,
      })
      .eq("id", reviewId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteReview(formData: FormData) {
    "use server";
    const reviewId = String(formData.get("reviewId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("review_sources")
      .delete()
      .eq("id", reviewId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Review Sources</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Manage external review sources (TripAdvisor, Google, etc.).
      </p>

      {reviewSummary && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="text-sm font-semibold text-green-900 mb-2">
            AI-Generated Review Summary
          </h3>
          <p className="text-sm text-green-800 whitespace-pre-line">
            {reviewSummary}
          </p>
          <p className="mt-2 text-xs text-green-700">
            This summary was generated from guest reviews and highlights common themes without naming individual reviewers.
          </p>
        </div>
      )}

      <div className="mt-6">
        <ReviewsManager
          reviews={reviews}
          createReview={createReview}
          updateReview={updateReview}
          deleteReview={deleteReview}
        />
      </div>
    </div>
  );
}
