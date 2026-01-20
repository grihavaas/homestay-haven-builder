import { motion } from "framer-motion";
import { Star, MapPin, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";
import heroImage from "@/assets/hero-homestay.jpg";

export function BackwaterHero() {
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
          src={heroImage}
          alt={propertyData.name}
          className="w-full h-full object-cover"
        />
        {/* Soft, reflective gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
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

        {/* Classification - minimal */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6"
        >
          {propertyData.classification}
        </motion.span>

        {/* Main title - elegant, spacious */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-foreground mb-6 tracking-tight"
        >
          {propertyData.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground font-light mb-4"
        >
          {propertyData.tagline}
        </motion.p>

        {/* Location - subtle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 text-muted-foreground mb-12"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{propertyData.location.city}, {propertyData.location.state}</span>
        </motion.div>

        {/* Rating - horizontal line style */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="w-12 h-px bg-border" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary fill-current" />
            <span className="text-sm font-medium">{propertyData.ratings.overall}</span>
            <span className="text-sm text-muted-foreground">· {propertyData.ratings.totalReviews} reviews</span>
          </div>
          <div className="w-12 h-px bg-border" />
        </motion.div>

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
          <Button variant="ghost" size="lg" className="rounded-full px-8" onClick={() => scrollToSection("#rooms")}>
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
    </section>
  );
}
