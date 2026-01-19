import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Car, Plane, Clock, Mountain } from "lucide-react";
import { propertyData } from "@/lib/propertyData";

export function Location() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="location" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            Location & Nearby
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
            Discover the Surroundings
          </h2>
          <p className="text-muted-foreground">
            {propertyData.location.description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="relative rounded-2xl overflow-hidden shadow-card bg-muted h-[400px]"
          >
            <iframe
              title="Location Map"
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31107.83!2d${propertyData.location.coordinates.longitude}!3d${propertyData.location.coordinates.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDI1JzI4LjAiTiA3NcKwNDQnMTcuNSJF!5e0!3m2!1sen!2sin!4v1704115200000!5m2!1sen!2sin`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">
                    {propertyData.location.address}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {propertyData.location.city}, {propertyData.location.state} - {propertyData.location.postalCode}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Distances & Attractions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* How to Reach */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                How to Reach
              </h3>
              <div className="space-y-4">
                {propertyData.location.proximity.slice(0, 3).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.name.includes("Airport") ? (
                        <Plane className="w-5 h-5 text-primary" />
                      ) : (
                        <Car className="w-5 h-5 text-primary" />
                      )}
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {item.distance}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Attractions */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Things to Do Nearby
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {propertyData.attractions.slice(0, 4).map((attraction) => (
                  <div
                    key={attraction.name}
                    className="bg-muted rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Mountain className="w-4 h-4 text-sage" />
                      <span className="text-xs text-sage uppercase tracking-wider">
                        {attraction.type}
                      </span>
                    </div>
                    <div className="font-medium text-foreground text-sm">
                      {attraction.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {attraction.distance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
