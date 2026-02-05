import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HeroEditor } from "@/components/edit-mode/editors/HeroEditor";
import heroImage from "@/assets/hero-homestay.jpg";

const HERO_ROTATE_MS = 5000;

export function BackwaterHero() {
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
  const totalReviews = property.review_sources?.reduce((sum: number, r: any) => sum + (r.total_reviews || 0), 0) || 0;
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Layered, flowing background - Backwater minimal style */}
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
        {/* Minimal gradient for text readability */}
        <div className="absolute inset-0 bg-black/20" />
        {allImages.length > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {allImages.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "w-8 bg-primary-foreground" : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Minimal centered content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Subtle anchor icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Anchor className="w-8 h-8 text-primary/60" />
        </motion.div>

        {/* Main title - elegant, spacious */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-foreground mb-6 tracking-tight"
        >
          {property.name}
        </motion.h1>

        {property.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground font-light mb-4"
          >
            {property.tagline}
          </motion.p>
        )}

        {/* Location - subtle */}
        {(property.city || property.state) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2 text-muted-foreground mb-12"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{[property.city, property.state].filter(Boolean).join(", ")}</span>
          </motion.div>
        )}

        {/* Rating - horizontal line style */}
        {avgRating > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-4 mb-16"
          >
            <div className="w-12 h-px bg-border" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-current" />
              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              {totalReviews > 0 && (
                <span className="text-sm text-muted-foreground">· {totalReviews} reviews</span>
              )}
            </div>
            <div className="w-12 h-px bg-border" />
          </motion.div>
        )}

        {isEditMode && (
          <div className="mb-8 flex justify-center">
            <EditButton onClick={() => setShowEditor(true)} label="Edit Main" />
          </div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" className="rounded-full px-8" onClick={() => scrollToSection("#booking")}>
            Reserve Now
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => scrollToSection("#rooms")}>
            View Rooms
          </Button>
        </motion.div>
      </div>

      {/* Horizontal scroll hint at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <motion.div
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <div className="w-8 h-px bg-border" />
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <div className="w-8 h-px bg-border" />
        </motion.div>
      </motion.div>

      {/* Hero Editor Bottom Sheet */}
      <HeroEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
