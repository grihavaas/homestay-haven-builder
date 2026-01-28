"use client";

import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HeroEditor } from "@/components/edit-mode/editors/HeroEditor";
import heroImage from "@/assets/hero-homestay.jpg";
import { useState, useEffect } from "react";

export function Hero() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditor, setShowEditor] = useState(false);

  if (loading || !property) {
    return null;
  }
  
  // Get all hero images from property media, then fallback to gallery, then default image
  const heroImages = property.media?.filter((m: any) => m.media_type === 'hero').map((m: any) => m.s3_url) || [];
  const galleryImages = property.media?.filter((m: any) => m.media_type === 'gallery').map((m: any) => m.s3_url) || [];
  
  // Combine hero images, fallback to gallery if no hero images, then default
  const allImages = heroImages.length > 0 
    ? heroImages 
    : galleryImages.length > 0 
    ? galleryImages 
    : [heroImage];
  
  // Auto-rotate images every 30 seconds if there are multiple images
  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000); // 5 seconds
    
    return () => clearInterval(interval);
  }, [allImages.length]);
  
  // Calculate average rating from reviews
  const avgRating = property.review_sources?.length > 0
    ? property.review_sources.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / property.review_sources.length
    : 0;
  // Sum total_reviews from all review sources, not just count of sources
  const totalReviews = property.review_sources?.reduce((sum: number, r: any) => sum + (r.total_reviews || 0), 0) || 0;
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {allImages.map((image: string, index: number) => (
          <motion.img
            key={image}
            src={image}
            alt={property.name}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.05
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        ))}
        {/* Minimal overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Image indicators (dots) - only show if multiple images */}
        {allImages.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {allImages.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'w-8 bg-primary-foreground' 
                    : 'w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl">
          {/* Badges */}
          {avgRating > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 backdrop-blur-sm text-gold text-sm">
                <Star className="w-4 h-4 fill-current" />
                {avgRating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </motion.div>
          )}

          {/* Main Heading */}
          <div className="relative inline-block">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold text-primary-foreground mb-4 leading-tight"
            >
              {property.name}
            </motion.h1>
            {isEditMode && (
              <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                <EditButton onClick={() => setShowEditor(true)} label="Edit" />
              </div>
            )}
          </div>

          {/* Tagline */}
          {property.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-primary-foreground/90 font-light mb-4"
            >
              {property.tagline}
            </motion.p>
          )}

          {/* Location */}
          {(property.city || property.state) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 text-primary-foreground/80 mb-8"
            >
              <MapPin className="w-5 h-5" />
              <span>{[property.city, property.state].filter(Boolean).join(", ")}</span>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              variant="hero"
              size="xl"
              onClick={() => scrollToSection("#booking")}
            >
              Book Your Stay
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              onClick={() => scrollToSection("#rooms")}
            >
              Explore Rooms
            </Button>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-2 mt-10"
          >
            {property.property_tags && property.property_tags.length > 0 && property.property_tags.slice(0, 4).map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs text-primary-foreground/70 border border-primary-foreground/30 rounded-full"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-primary-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Hero Editor Bottom Sheet */}
      <HeroEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
