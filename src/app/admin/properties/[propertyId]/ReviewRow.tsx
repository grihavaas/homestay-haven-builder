"use client";

import { useRouter } from "next/navigation";
import type { Review } from "./ReviewsList";

interface ReviewRowProps {
  review: Review;
  isEditing: boolean;
  onEdit: (reviewId: string | null) => void;
  updateReview: (formData: FormData) => Promise<void>;
  deleteReview: (formData: FormData) => Promise<void>;
}

export function ReviewRow({
  review,
  isEditing,
  onEdit,
  updateReview,
  deleteReview,
}: ReviewRowProps) {
  const router = useRouter();

  if (isEditing) {
    return (
      <div className="p-3">
        <form
          action={async (formData: FormData) => {
            formData.append("reviewId", review.id);
            await updateReview(formData);
            onEdit(null);
            router.refresh();
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Edit Review Source</h4>
            <button
              type="button"
              onClick={() => onEdit(null)}
              className="text-xs text-zinc-600 hover:underline"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Site Name</div>
              <select
                name="site_name"
                defaultValue={review.site_name}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                required
              >
                <option value="">Select site</option>
                <option value="TripAdvisor">TripAdvisor</option>
                <option value="Google">Google</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Booking.com">Booking.com</option>
                <option value="MakeMyTrip">MakeMyTrip</option>
              </select>
            </label>
            <label className="block">
              <div className="text-sm font-medium">Stars (0-5)</div>
              <input
                name="stars"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={review.stars || ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Total Reviews</div>
              <input
                name="total_reviews"
                type="number"
                min="0"
                defaultValue={review.total_reviews || 0}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Display Order</div>
              <input
                name="display_order"
                type="number"
                min="0"
                defaultValue={review.display_order || 0}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <div className="text-sm font-medium">Review URL</div>
            <input
              name="review_url"
              type="url"
              defaultValue={review.review_url || ""}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm text-white"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => onEdit(null)}
              className="rounded-md border px-4 py-2 text-sm text-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 text-sm">
      <div>
        <div className="font-medium">{review.site_name}</div>
        {review.review_url && (
          <a
            href={review.review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View reviews
          </a>
        )}
      </div>
      <div>{review.stars ? `${review.stars} ⭐` : "—"}</div>
      <div>{review.total_reviews || 0}</div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(review.id)}
          className="text-xs text-blue-600 hover:underline"
        >
          Edit
        </button>
        <form action={deleteReview}>
          <input type="hidden" name="reviewId" value={review.id} />
          <button
            type="submit"
            className="text-xs text-red-600 hover:underline"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
