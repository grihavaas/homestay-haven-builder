"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startCrawl } from "./actions";

export function NewDiscoveryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [listingUrls, setListingUrls] = useState([""]);
  const [reviewUrls, setReviewUrls] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addListingUrl() {
    if (listingUrls.length < 3) setListingUrls([...listingUrls, ""]);
  }

  function addReviewUrl() {
    if (reviewUrls.length < 3) setReviewUrls([...reviewUrls, ""]);
  }

  function updateListingUrl(index: number, value: string) {
    const updated = [...listingUrls];
    updated[index] = value;
    setListingUrls(updated);
  }

  function updateReviewUrl(index: number, value: string) {
    const updated = [...reviewUrls];
    updated[index] = value;
    setReviewUrls(updated);
  }

  function removeListingUrl(index: number) {
    if (listingUrls.length > 1) {
      setListingUrls(listingUrls.filter((_, i) => i !== index));
    }
  }

  function removeReviewUrl(index: number) {
    setReviewUrls(reviewUrls.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError(null);
    const validListings = listingUrls.map((u) => u.trim()).filter(Boolean);
    if (validListings.length === 0) {
      setError("At least one listing URL is required.");
      return;
    }

    setSubmitting(true);
    try {
      const validReviews = reviewUrls.map((u) => u.trim()).filter(Boolean);
      const result = await startCrawl(validListings, validReviews);

      if (!result.success) {
        setError(result.error || "Failed to start discovery");
        return;
      }

      setOpen(false);
      setListingUrls([""]);
      setReviewUrls([""]);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New Discovery</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Discovery</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Listing URLs (max 3)</Label>
            {listingUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="https://www.airbnb.com/rooms/..."
                  value={url}
                  onChange={(e) => updateListingUrl(i, e.target.value)}
                />
                {listingUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeListingUrl(i)}
                    className="shrink-0 text-zinc-400 hover:text-zinc-600"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {listingUrls.length < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addListingUrl}
              >
                + Add URL
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Review URLs (optional, max 3)</Label>
            {reviewUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="https://www.google.com/maps/place/..."
                  value={url}
                  onChange={(e) => updateReviewUrl(i, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReviewUrl(i)}
                  className="shrink-0 text-zinc-400 hover:text-zinc-600"
                >
                  Remove
                </Button>
              </div>
            ))}
            {reviewUrls.length < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addReviewUrl}
              >
                + Add Review URL
              </Button>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Starting..." : "Start Crawl"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
