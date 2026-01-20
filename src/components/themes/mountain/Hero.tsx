import { motion } from "framer-motion";
import { Star, MapPin, Award, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";
import heroImage from "@/assets/hero-homestay.jpg";

export function MountainHero() {
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
        <img
          src={heroImage}
          alt={propertyData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-foreground/40" />
      </div>

      {/* Centered content with strong typography */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Mountain icon accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Mountain className="w-16 h-16 text-primary mx-auto" />
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 bg-primary/20 text-primary rounded text-sm font-bold uppercase tracking-widest mb-6"
          >
            {propertyData.classification}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-primary-foreground mb-6 leading-none"
          >
            {propertyData.name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-24 h-1 bg-primary mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-primary-foreground/80 mb-4"
          >
            {propertyData.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-primary-foreground/70 mb-10"
          >
            <MapPin className="w-5 h-5" />
            <span>{propertyData.location.city}, {propertyData.location.state}</span>
          </motion.div>

          {/* Rating badge */}
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
                  i < Math.floor(propertyData.ratings.overall)
                    ? "text-primary fill-current"
                    : "text-primary/30"
                }`}
              />
            ))}
            <span className="ml-2 text-primary-foreground font-semibold">
              {propertyData.ratings.overall}
            </span>
          </motion.div>

          {/* Stacked CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="min-w-48" onClick={() => scrollToSection("#booking")}>
              Reserve Your Retreat
            </Button>
            <Button variant="outline" size="lg" className="min-w-48 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => scrollToSection("#rooms")}>
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
    </section>
  );
}
