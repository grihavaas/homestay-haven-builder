"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SWIPE_THRESHOLD_PX = 50;

type RoomImageCarouselProps = {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function RoomImageCarousel({
  images,
  alt,
  className = "",
  imageClassName = "",
}: RoomImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const allImages = images.length > 0 ? images : [];

  if (allImages.length === 0) {
    return null;
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const openLightbox = () => {
    setLightboxIndex(currentIndex);
    setLightboxOpen(true);
  };

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || allImages.length <= 1) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD_PX) lightboxPrev();
    else if (delta < -SWIPE_THRESHOLD_PX) lightboxNext();
    touchStartX.current = null;
  };

  return (
    <>
      <div className={`relative w-full h-full min-h-0 overflow-hidden ${className}`}>
        {/* Clickable image area - opens lightbox */}
        <button
          type="button"
          onClick={openLightbox}
          className="absolute inset-0 z-[1] cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-inherit"
          aria-label={`View ${alt} full size`}
        >
          <span className="sr-only">View larger</span>
        </button>

        <AnimatePresence mode="wait">
          <motion.img
            key={allImages[currentIndex]}
            src={allImages[currentIndex]}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${imageClassName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Left / Right arrows - only when multiple images */}
        {allImages.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 border-0 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 border-0 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Dots at bottom */}
        {allImages.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none"
            aria-hidden
          >
            {allImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                  index === currentIndex
                    ? "w-5 bg-white shadow-sm"
                    : "w-1.5 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 gap-0 border-0 bg-black/95 overflow-hidden [&>button]:hidden"
          onPointerDownOutside={(e) => e.stopPropagation()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">{alt} – full size view</DialogTitle>

          {/* Close button - top right */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-20 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>

          <div
            className="relative flex items-center justify-center min-h-[70vh] w-full p-4 touch-none"
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <img
              src={allImages[lightboxIndex]}
              alt={alt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded select-none pointer-events-none"
              draggable={false}
            />

            {allImages.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
                  onClick={lightboxPrev}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
                  onClick={lightboxNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
