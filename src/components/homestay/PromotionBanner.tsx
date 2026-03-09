"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";

interface SpecialOffer {
  id: string;
  title: string;
  description?: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
}

function formatOfferText(offer: SpecialOffer): string {
  if (offer.discount_percentage) {
    return `${offer.discount_percentage}% Off — ${offer.title}`;
  }
  if (offer.discount_amount) {
    return `Save ₹${Number(offer.discount_amount).toLocaleString()} — ${offer.title}`;
  }
  return offer.title;
}

function isOfferCurrentlyValid(offer: SpecialOffer): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (offer.valid_from) {
    const from = new Date(offer.valid_from);
    if (today < new Date(from.getFullYear(), from.getMonth(), from.getDate())) return false;
  }
  if (offer.valid_to) {
    const to = new Date(offer.valid_to);
    if (today > new Date(to.getFullYear(), to.getMonth(), to.getDate())) return false;
  }
  return true;
}

export function PromotionBanner() {
  const { property } = useProperty();
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const propertyId = property?.id;
  const storageKey = propertyId ? `promo-dismissed-${propertyId}` : null;

  const validOffers: SpecialOffer[] = (property?.special_offers ?? []).filter(isOfferCurrentlyValid);

  // Check sessionStorage on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const wasDismissed = sessionStorage.getItem(storageKey) === "true";
      setDismissed(wasDismissed);
      if (!wasDismissed && validOffers.length > 0) {
        // Delay to trigger slide-in animation
        requestAnimationFrame(() => setIsVisible(true));
      }
    } catch {
      setDismissed(false);
      if (validOffers.length > 0) {
        requestAnimationFrame(() => setIsVisible(true));
      }
    }
  }, [storageKey, validOffers.length]);

  // Cycle through offers
  useEffect(() => {
    if (validOffers.length <= 1) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % validOffers.length);
        setIsFading(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [validOffers.length]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setDismissed(true);
      if (storageKey) {
        try {
          sessionStorage.setItem(storageKey, "true");
        } catch {}
      }
    }, 300);
  }, [storageKey]);

  const handleBookNow = useCallback(() => {
    const offer = validOffers[currentIndex];
    if (offer) {
      const offerParam = encodeURIComponent(formatOfferText(offer));
      window.history.replaceState(null, "", `#booking?offer=${offerParam}`);
    }
    const el = document.querySelector("#booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [validOffers, currentIndex]);

  if (dismissed || validOffers.length === 0) return null;

  const currentOffer = validOffers[currentIndex];

  return (
    <div
      className={`sticky top-20 left-0 right-0 z-40 bg-primary text-primary-foreground overflow-hidden transition-all duration-300 ease-out ${
        isVisible ? "max-h-14 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="container mx-auto px-4 h-11 flex items-center justify-between gap-3">
        {/* Left: Icon + Offer text */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <span
            className={`text-sm font-medium truncate transition-opacity duration-300 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            {formatOfferText(currentOffer)}
          </span>
          {currentOffer.description && (
            <span
              className={`hidden md:inline text-xs text-primary-foreground/70 truncate transition-opacity duration-300 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              — {currentOffer.description}
            </span>
          )}
        </div>

        {/* Right: CTA + Dismiss */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleBookNow}
            className="text-xs font-semibold bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            Book Now
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
            aria-label="Dismiss promotion"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
