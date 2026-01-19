import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Wifi,
  Car,
  Waves,
  UtensilsCrossed,
  Sparkles,
  Clock,
  Shirt,
  Plane,
  TreePine,
  Flame,
  BookOpen,
  PawPrint,
  Baby,
  Coffee,
  Mountain,
  ConciergeBell,
} from "lucide-react";
import { propertyData } from "@/lib/propertyData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Car,
  Waves,
  UtensilsCrossed,
  Sparkles,
  Clock,
  Shirt,
  Plane,
  TreePine,
  Flame,
  BookOpen,
  PawPrint,
  Baby,
  Coffee,
  Mountain,
  ConciergeBell,
};

export function Amenities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="amenities" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            Facilities & Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
            Everything You Need, and More
          </h2>
          <p className="text-muted-foreground">
            From relaxing spa treatments to adventurous plantation tours, we offer 
            a range of amenities to make your stay memorable.
          </p>
        </motion.div>

        {/* Core Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {propertyData.amenities.core.map((amenity, index) => {
            const Icon = iconMap[amenity.icon] || Sparkles;
            return (
              <motion.div
                key={amenity.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-5 shadow-soft hover:shadow-card transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{amenity.name}</h3>
                <p className="text-xs text-muted-foreground">{amenity.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Special Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="bg-gradient-sage rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-2xl font-serif font-semibold text-accent-foreground mb-6 text-center">
            Special Experiences
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {propertyData.amenities.special.map((amenity) => {
              const Icon = iconMap[amenity.icon] || Sparkles;
              return (
                <div
                  key={amenity.name}
                  className="bg-accent-foreground/10 rounded-xl p-5 backdrop-blur-sm"
                >
                  <Icon className="w-8 h-8 text-accent-foreground mb-3" />
                  <h4 className="font-medium text-accent-foreground mb-1">
                    {amenity.name}
                  </h4>
                  <p className="text-sm text-accent-foreground/80">{amenity.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
