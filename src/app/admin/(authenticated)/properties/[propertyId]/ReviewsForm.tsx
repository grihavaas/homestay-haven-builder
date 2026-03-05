"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useActionWithTimeout } from "@/hooks/use-action-with-timeout";
import { Loader2 } from "lucide-react";

export function ReviewsForm({ 
  createReview,
  isOpen,
  onOpenChange,
}: { 
  createReview: (formData: FormData) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { isSubmitting, execute } = useActionWithTimeout();

  if (!isOpen) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        Add Review Source
      </button>
    );
  }

  return (
    <form action={createReview} className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Add Review Source</h3>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-sm text-zinc-600 hover:underline"
        >
          Cancel
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Site Name</div>
          <select
            name="site_name"
            className="mt-1 w-full rounded-md border px-3 py-2"
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
            className="mt-1 w-full rounded-md border px-3 py-2"
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
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Display Order</div>
          <input
            name="display_order"
            type="number"
            min="0"
            defaultValue="0"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">Review URL</div>
        <input
          name="review_url"
          type="url"
          placeholder="https://..."
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          onClick={async (e) => {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (form) {
              await execute(async () => {
                try {
                  const formData = new FormData(form);
                  await createReview(formData);
                  onOpenChange(false);
                  router.refresh();
                } catch (err) {
                  console.error("Save error:", err);
                  toast({ title: "Error", description: "Failed to add review source. Please try again.", variant: "destructive" });
                }
              });
            }
          }}
        >
          {isSubmitting ? <><Loader2 className="inline w-4 h-4 animate-spin mr-1 align-text-bottom" />Adding...</> : "Add Review Source"}
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md border px-4 py-2 text-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
