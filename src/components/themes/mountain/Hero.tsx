import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HeroEditor } from "@/components/edit-mode/editors/HeroEditor";
import heroImage from "@/assets/hero-homestay.jpg";

const HERO_ROTATE_MS = 5000;

export function MountainHero() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [showEditor, setShowEditor] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (loading || !property) {
    return null;
  }

  const heroImages = property.media?.filter((m: any) => m.media_type === "hero").map((m: any) => m.s3_url) || [];
  const galleryImages = property.media?.filter((m: any) => m.media_type === "gallery").map((m: any) => m.s3_url) || [];
  const allImages =
    heroImages.length > 0 ? heroImages : galleryImages.length > 0 ? galleryImages : [heroImage];

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [allImages.length]);
  const avgRating = property.review_sources?.length > 0
    ? property.review_sources.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / property.review_sources.length
    : 0;
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center">
      {/* Dramatic dark overlay - Mountain style */}
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
              scale: index === currentImageIndex ? 1 : 1.05,
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        ))}
        {/* Minimal overlay for text readability */}
        <div className="absolute inset-0 bg-black/25" />
        {allImages.length > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {allImages.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-primary/40 hover:bg-primary/60"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Centered content with strong typography */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-primary-foreground mb-6 leading-none"
          >
            {property.name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-24 h-1 bg-primary mx-auto mb-6"
          />

          {property.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-primary-foreground/80 mb-4"
            >
              {property.tagline}
            </motion.p>
          )}

          {(property.city || property.state) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-primary-foreground/70 mb-10"
            >
              <MapPin className="w-5 h-5" />
              <span>{[property.city, property.state].filter(Boolean).join(", ")}</span>
            </motion.div>
          )}

          {/* Rating badge */}
          {avgRating > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-1 mb-10"
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(avgRating)
                      ? "text-primary fill-current"
                      : "text-primary/30"
                  }`}
                />
              ))}
              <span className="ml-2 text-primary-foreground font-semibold">
                {avgRating.toFixed(1)}
              </span>
            </motion.div>
          )}

          {isEditMode && (
            <div className="mb-8">
              <EditButton onClick={() => setShowEditor(true)} label="Edit hero" />
            </div>
          )}

          {/* CTAs - same width on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4"
          >
            <Button size="lg" className="flex-1 sm:flex-initial min-w-0 basis-0 sm:basis-auto sm:min-w-48" onClick={() => scrollToSection("#booking")}>
              Reserve Your Retreat
            </Button>
            <Button variant="heroOutline" size="lg" className="flex-1 sm:flex-initial min-w-0 basis-0 sm:basis-auto sm:min-w-48" onClick={() => scrollToSection("#rooms")}>
              Explore Accommodations
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Vertical scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-primary-foreground/50 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </motion.div>

      {/* Hero Editor Bottom Sheet */}
      <HeroEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
