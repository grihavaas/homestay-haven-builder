"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ROOM_CAROUSEL_INTERVAL_MS = 5000;

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
  const allImages = images.length > 0 ? images : [];

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, ROOM_CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [allImages.length]);

  if (allImages.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full h-full min-h-0 overflow-hidden ${className}`}>
      {allImages.map((src, index) => (
        <motion.img
          key={src}
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${imageClassName}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.03,
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      ))}
      {allImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {allImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
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
  );
}
