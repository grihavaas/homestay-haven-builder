import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Maximize, Bed, Anchor } from "lucide-react";
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

export function BackwaterRooms() {
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
        {/* Backwater-style header: centered, minimal, flowing */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="text-center max-w-xl mx-auto mb-20"
        >
          <Anchor className="w-6 h-6 text-primary/50 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-serif font-light text-foreground mb-4 tracking-tight">
            Waterside Retreats
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-border" />
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Accommodations</span>
            <div className="w-12 h-px bg-border" />
          </div>
          <p className="text-muted-foreground font-light">
            Drift into serenity with our thoughtfully designed spaces
          </p>
        </motion.div>

        {/* Clean, minimal grid with generous spacing - Backwater style */}
        <div className="grid md:grid-cols-3 gap-8">
          {propertyData.rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15 }}
              className="group"
            >
              <div className="bg-background rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-shadow duration-500">
                {/* Circular-ish image container */}
                <div className="relative p-6 pb-0">
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <img
                      src={roomImages[room.id]}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {/* View badge - floating */}
                  <div className="absolute top-8 right-8 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-soft">
                    <span className="text-xs text-muted-foreground">{room.view}</span>
                  </div>
                </div>

                {/* Content - clean and spacious */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-serif font-medium text-foreground mb-2">
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Minimal stats */}
                  <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-6">
                    <div className="flex flex-col items-center">
                      <Users className="w-4 h-4 text-primary mb-1" />
                      <span>{room.capacity.maxGuests}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Maximize className="w-4 h-4 text-primary mb-1" />
                      <span>{room.size}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bed className="w-4 h-4 text-primary mb-1" />
                      <span>{room.beds[0].type}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-xs text-muted-foreground line-through block">
                      ₹{room.basePrice.toLocaleString()}
                    </span>
                    <span className="text-2xl font-serif text-primary">
                      ₹{room.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">/night</span>
                  </div>

                  {/* CTA */}
                  <Button 
                    variant="outline" 
                    className="rounded-full w-full"
                    onClick={scrollToBooking}
                  >
                    Reserve
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
