import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Users, Maximize, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { RoomEditor } from "@/components/edit-mode/editors/RoomEditor";
import { RoomFeaturesSection } from "@/components/homestay/RoomFeaturesSection";
import { RoomImageCarousel } from "@/components/homestay/RoomImageCarousel";

import roomDeluxe from "@/assets/room-deluxe.jpg";

export function BeachRooms() {
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Beach-style header: breezy, horizontal */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Accommodations
            </span>
            {property.room_section_header && (
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mt-2">
                {property.room_section_header}
              </h2>
            )}
            {property.room_section_tagline && (
              <p className="text-muted-foreground max-w-md mt-2">
                {property.room_section_tagline}
              </p>
            )}
          </div>
        </motion.div>

        {/* Grid layout for rooms - Beach style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {property.rooms.map((room: any, index: number) => {
            const roomImages = (property.media?.filter((m: any) => m.room_id === room.id && m.media_type === "room_image") ?? [])
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((m: any) => m.s3_url);
            const allRoomImages = roomImages.length > 0 ? roomImages : [roomDeluxe];
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
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0"
            >
              <div className="bg-background rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300 h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <RoomImageCarousel
                    images={allRoomImages}
                    alt={room.name}
                    className="w-full h-full"
                    imageClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                  {room.view_type && (
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs text-muted-foreground font-medium">{room.view_type}</span>
                    </div>
                  )}
                  {/* Price badge on image */}
                  {price && (
                    <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-soft">
                      {originalPrice && originalPrice > price && (
                        <span className="text-xs text-muted-foreground line-through block">
                          ₹{Number(originalPrice).toLocaleString()}
                        </span>
                      )}
                      <div className="text-lg font-serif font-semibold text-primary">
                        ₹{Number(price).toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground">/night</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="relative inline-block">
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
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
                    <div className="mb-4 flex-grow">
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

                  {/* Quick stats */}
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    {room.max_guests && (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        <span>
                          {room.adults_capacity && room.children_capacity && 
                           (room.adults_capacity + room.children_capacity <= room.max_guests) ? (
                            <>{room.max_guests} guests (max {room.adults_capacity} adults, {room.children_capacity} children)</>
                          ) : (
                            <>{room.max_guests} guests</>
                          )}
                        </span>
                      </span>
                    )}
                    {room.room_size_sqft && (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Maximize className="w-4 h-4 text-primary" />
                        <span>{room.room_size_sqft} sq ft</span>
                      </span>
                    )}
                  </div>

                  {/* Room Amenities - Separate section */}
                  {room.room_amenities && room.room_amenities.length > 0 && (
                    <div className="mb-4">
                      <RoomFeaturesSection 
                        roomFeatures={null}
                        roomAmenities={room.room_amenities}
                        variant="compact"
                      />
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto pt-4 border-t border-border">
                    <Button size="sm" className="w-full" onClick={scrollToBooking}>
                      Book This Room <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
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
