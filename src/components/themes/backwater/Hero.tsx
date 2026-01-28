import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HeroEditor } from "@/components/edit-mode/editors/HeroEditor";
import heroImage from "@/assets/hero-homestay.jpg";

export function BackwaterHero() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [showEditor, setShowEditor] = useState(false);

  if (loading || !property) {
    return null;
  }
  
  const heroMedia = property.media?.find((m: any) => m.media_type === 'hero' || m.media_type === 'gallery')?.s3_url || heroImage;
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
        <img
          src={heroMedia}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* Minimal gradient for text readability */}
        <div className="absolute inset-0 bg-black/20" />
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
        <div className="relative inline-block">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-foreground mb-6 tracking-tight"
          >
            {property.name}
          </motion.h1>
          {isEditMode && (
            <div className="absolute -right-12 top-1/2 -translate-y-1/2">
              <EditButton onClick={() => setShowEditor(true)} label="Edit" />
            </div>
          )}
        </div>

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

        {/* CTAs - minimal, rounded */}
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
