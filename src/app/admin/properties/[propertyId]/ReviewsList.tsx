export interface Review {
  id: string;
  site_name: string;
  stars: number | null;
  total_reviews: number | null;
  review_url: string | null;
  display_order: number | null;
}

interface ReviewsListProps {
  reviews: Review[];
  editReviewId: string | null;
  onEdit: (reviewId: string | null) => void;
  updateReview: (formData: FormData) => Promise<void>;
  deleteReview: (formData: FormData) => Promise<void>;
}

import { ReviewRow } from "./ReviewRow";

export function ReviewsList({ reviews, editReviewId, onEdit, updateReview, deleteReview }: ReviewsListProps) {
  return (
    <div className="mt-8 rounded-lg border">
      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
        <div>Site</div>
        <div>Rating</div>
        <div>Reviews</div>
        <div>Actions</div>
      </div>
      <div className="divide-y">
        {reviews.map((review) => (
          <ReviewRow
            key={review.id}
            review={review}
            isEditing={editReviewId === review.id}
            onEdit={onEdit}
            updateReview={updateReview}
            deleteReview={deleteReview}
          />
        ))}
        {reviews.length === 0 ? (
          <div className="p-3 text-sm text-zinc-600">No review sources yet.</div>
        ) : null}
      </div>
    </div>
  );
}
