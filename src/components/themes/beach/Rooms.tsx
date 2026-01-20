import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Maximize, Bed, Check, ArrowRight } from "lucide-react";
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

export function BeachRooms() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToBooking = () => {
    const element = document.querySelector("#booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="rooms" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Beach-style header: breezy, horizontal */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16"
        >
          <div>
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Accommodations
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mt-2">
              Coastal Comfort
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Wake up to ocean breezes in our thoughtfully designed rooms, each offering a serene retreat.
          </p>
        </motion.div>

        {/* Horizontal scrolling cards - Beach style */}
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory">
          {propertyData.rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.15 }}
              className="min-w-[320px] md:min-w-[400px] flex-shrink-0 snap-start"
            >
              <div className="bg-background rounded-3xl overflow-hidden shadow-card h-full">
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <img
                    src={roomImages[room.id]}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-full px-4 py-1">
                    <span className="text-xs text-muted-foreground">{room.view}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Quick stats */}
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      {room.capacity.maxGuests}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize className="w-4 h-4 text-primary" />
                      {room.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4 text-primary" />
                      {room.beds[0].type}
                    </span>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{room.basePrice.toLocaleString()}
                      </span>
                      <div className="text-xl font-serif font-semibold text-primary">
                        ₹{room.discountedPrice.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground">/night</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={scrollToBooking}>
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
