import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Maximize, Bed, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";

import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomCottage from "@/assets/room-cottage.jpg";

const roomImages: Record<string, string> = {
  "deluxe-room": roomDeluxe,
  "family-suite": roomSuite,
  "garden-cottage": roomCottage,
};

export function ForestRooms() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToBooking = () => {
    const element = document.querySelector("#booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="rooms" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Forest-style header: asymmetric, editorial */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
          >
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm uppercase tracking-wider text-primary font-medium">
                Accommodations
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground leading-tight">
              Nestled in Nature's Embrace
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-end"
          >
            <p className="text-lg text-muted-foreground">
              Each dwelling is designed to harmonize with the forest surroundings, 
              offering an immersive connection to the natural world.
            </p>
          </motion.div>
        </div>

        {/* Asymmetric masonry grid - Forest editorial style */}
        <div className="grid md:grid-cols-2 gap-8">
          {propertyData.rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15 }}
              className={`group ${index === 0 ? 'md:row-span-2' : ''}`}
            >
              <div className={`relative rounded-2xl overflow-hidden ${index === 0 ? 'h-full' : ''}`}>
                {/* Image with organic border */}
                <div className={`relative ${index === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
                  <img
                    src={roomImages[room.id]}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                </div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  {/* View tag */}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary-foreground text-xs rounded-full mb-4">
                    <Leaf className="w-3 h-3" />
                    {room.view}
                  </span>

                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-primary-foreground mb-2">
                    {room.name}
                  </h3>

                  <p className="text-primary-foreground/80 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 text-primary-foreground/70 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {room.capacity.maxGuests} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize className="w-4 h-4" />
                      {room.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {room.beds[0].type}
                    </span>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-primary-foreground/20">
                    <div>
                      <span className="text-xs text-primary-foreground/60 line-through">
                        ₹{room.basePrice.toLocaleString()}
                      </span>
                      <div className="text-xl font-serif font-semibold text-primary-foreground">
                        ₹{room.discountedPrice.toLocaleString()}
                        <span className="text-xs font-normal opacity-70">/night</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                      onClick={scrollToBooking}
                    >
                      Book <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
