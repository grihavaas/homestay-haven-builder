import { motion } from "framer-motion";
import { Star, MapPin, TreePine, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";
import heroImage from "@/assets/hero-homestay.jpg";

export function ForestHero() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen">
      {/* Asymmetric split layout - Forest editorial style */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left: Content with organic shapes */}
        <div className="relative flex items-center order-2 lg:order-1 bg-background">
          {/* Organic decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container px-8 lg:px-16 py-20 relative z-10">
            {/* Leaf accent */}
            <motion.div
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <Leaf className="w-6 h-6 text-primary" />
              <div className="h-px w-16 bg-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {propertyData.type}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground mb-6 leading-tight"
            >
              {propertyData.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-6 max-w-md"
            >
              {propertyData.tagline}
            </motion.p>

            {/* Location with organic border */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-primary/30 rounded-full mb-8"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">{propertyData.location.city}, {propertyData.location.state}</span>
            </motion.div>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(propertyData.ratings.overall)
                        ? "text-secondary fill-current"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {propertyData.ratings.overall} · {propertyData.ratings.totalReviews} reviews
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" onClick={() => scrollToSection("#booking")}>
                <TreePine className="w-4 h-4 mr-2" />
                Book Your Escape
              </Button>
              <Button variant="ghost" size="lg" onClick={() => scrollToSection("#rooms")}>
                Discover Rooms →
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Right: Full-height image */}
        <div className="relative order-1 lg:order-2 min-h-[50vh] lg:min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={heroImage}
              alt={propertyData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/20" />
          </motion.div>

          {/* Floating classification badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 right-8 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-elevated"
          >
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Certified</span>
            <p className="font-serif font-semibold text-foreground">{propertyData.classification}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
