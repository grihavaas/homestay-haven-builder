import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Users, Maximize, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { RoomEditor } from "@/components/edit-mode/editors/RoomEditor";
import { RoomFeaturesSection } from "@/components/homestay/RoomFeaturesSection";

import roomDeluxe from "@/assets/room-deluxe.jpg";

export function BackwaterRooms() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [editingRoom, setEditingRoom] = useState<any>(null);

  if (loading || !property || !property.rooms || property.rooms.length === 0) {
    return null;
  }

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
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-px bg-border" />
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Accommodations</span>
            <div className="w-12 h-px bg-border" />
          </div>
          {property.room_section_header && (
            <h2 className="text-3xl md:text-5xl font-serif font-light text-foreground mb-4 tracking-tight">
              {property.room_section_header}
            </h2>
          )}
          {property.room_section_tagline && (
            <p className="text-muted-foreground font-light">
              {property.room_section_tagline}
            </p>
          )}
        </motion.div>

        {/* Clean, minimal grid with generous spacing - Backwater style */}
        <div className="grid md:grid-cols-3 gap-8">
          {property.rooms.map((room: any, index: number) => {
            const roomImage = property.media?.find((m: any) => m.room_id === room.id && m.media_type === 'room_image')?.s3_url || roomDeluxe;
            const currentPricing = room.pricing?.find((p: any) => {
              const today = new Date();
              const validFrom = p.valid_from ? new Date(p.valid_from) : null;
              const validTo = p.valid_to ? new Date(p.valid_to) : null;
              return (!validFrom || today >= validFrom) && (!validTo || today <= validTo);
            }) || room.pricing?.[0];
            const price = currentPricing?.discounted_rate || currentPricing?.base_rate || room.base_rate;
            const originalPrice = currentPricing?.original_price || currentPricing?.base_rate;
            
            return (
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
                      src={roomImage}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {/* View badge - floating */}
                  {room.view_type && (
                    <div className="absolute top-8 right-8 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-soft">
                      <span className="text-xs text-muted-foreground">{room.view_type}</span>
                    </div>
                  )}
                </div>

                {/* Content - clean and spacious */}
                <div className="p-6 text-center">
                  <div className="relative inline-block">
                    <h3 className="text-xl font-serif font-medium text-foreground mb-2">
                      {room.name}
                    </h3>
                    {isEditMode && (
                      <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                        <EditButton onClick={() => setEditingRoom(room)} label="Edit" />
                      </div>
                    )}
                  </div>
                  
                  {/* Description with Room Features/USP integrated */}
                  {(room.description || room.room_features) && (
                    <div className="mb-6">
                      {room.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      {room.room_features && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Features: </span>
                          {room.room_features}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Minimal stats */}
                  <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-6">
                    {room.max_guests && (
                      <div className="flex flex-col items-center">
                        <Users className="w-4 h-4 text-primary mb-1" />
                        <span>
                          {room.adults_capacity && room.children_capacity && 
                           (room.adults_capacity + room.children_capacity <= room.max_guests) ? (
                            <>{room.max_guests} ({room.adults_capacity}A/{room.children_capacity}C)</>
                          ) : (
                            <>{room.max_guests}</>
                          )}
                        </span>
                      </div>
                    )}
                    {room.room_size_sqft && (
                      <div className="flex flex-col items-center">
                        <Maximize className="w-4 h-4 text-primary mb-1" />
                        <span>{room.room_size_sqft} sq ft</span>
                      </div>
                    )}
                  </div>

                  {/* Room Amenities - Separate section */}
                  {room.room_amenities && room.room_amenities.length > 0 && (
                    <div className="mb-6">
                      <RoomFeaturesSection 
                        roomFeatures={null}
                        roomAmenities={room.room_amenities}
                        variant="compact"
                      />
                    </div>
                  )}

                  {/* Price */}
                  {price && (
                    <div className="mb-6">
                      {originalPrice && originalPrice > price && (
                        <span className="text-xs text-muted-foreground line-through block">
                          ₹{Number(originalPrice).toLocaleString()}
                        </span>
                      )}
                      <span className="text-2xl font-serif text-primary">
                        ₹{Number(price).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                  )}

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
            );
          })}
        </div>
      </div>

      {/* Room Editor Bottom Sheet */}
      <RoomEditor
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        room={editingRoom}
      />
    </section>
  );
}
