"use client";

import { useState } from "react";
import { ReviewsForm } from "./ReviewsForm";
import { ReviewsList } from "./ReviewsList";

interface Review {
  id: string;
  site_name: string;
  stars: number | null;
  total_reviews: number | null;
  review_url: string | null;
  display_order: number | null;
}

interface ReviewsManagerProps {
  reviews: Review[];
  createReview: (formData: FormData) => Promise<void>;
  updateReview: (formData: FormData) => Promise<void>;
  deleteReview: (formData: FormData) => Promise<void>;
}

export function ReviewsManager({ reviews, createReview, updateReview, deleteReview }: ReviewsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);

  return (
    <>
      <div className="mt-6">
        <ReviewsForm 
          createReview={createReview} 
          isOpen={showForm}
          onOpenChange={setShowForm}
        />
      </div>

      {!showForm && (
        <ReviewsList
          reviews={reviews}
          editReviewId={editReviewId}
          onEdit={setEditReviewId}
          updateReview={updateReview}
          deleteReview={deleteReview}
        />
      )}
    </>
  );
}
