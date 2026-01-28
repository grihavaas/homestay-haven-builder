import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Users, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { RoomEditor } from "@/components/edit-mode/editors/RoomEditor";
import { RoomFeaturesSection } from "./RoomFeaturesSection";

import roomDeluxe from "@/assets/room-deluxe.jpg";

export function Rooms() {
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
    <section id="rooms" className="py-20 md:py-32 bg-cream-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            Accommodations
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
            {property.room_section_header || "Our Rooms & Suites"}
          </h2>
          <p className="text-muted-foreground">
            {property.room_section_tagline || "Comfortable spaces designed for relaxation and rejuvenation"}
          </p>
        </motion.div>

        {/* Rooms Grid */}
        <div className="space-y-12">
          {property.rooms.map((room: any, index: number) => {
            // Get room image from media
            // Schema: media has s3_url and media_type (hero, gallery, room_image, video, host_image)
            const roomImage = property.media?.find((m: any) => m.room_id === room.id && m.media_type === 'room_image')?.s3_url || roomDeluxe;
            // Get current pricing (most recent valid pricing)
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
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              className={`grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-elevated group">
                  <img
                    src={roomImage}
                    alt={room.name}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Price Badge */}
                  {price && (
                    <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-soft">
                      {originalPrice && originalPrice > price && (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{Number(originalPrice).toLocaleString()}
                        </div>
                      )}
                      <div className="text-xl font-serif font-semibold text-primary">
                        ₹{Number(price).toLocaleString()}
                        <span className="text-xs text-muted-foreground font-normal">/night</span>
                      </div>
                    </div>
                  )}
                  {/* View Badge */}
                  {room.view_type && (
                    <div className="absolute bottom-4 left-4 bg-charcoal/80 backdrop-blur-sm rounded-full px-3 py-1 text-primary-foreground text-sm">
                      {room.view_type}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="relative inline-block">
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-3">
                    {room.name}
                  </h3>
                  {isEditMode && (
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                      <EditButton onClick={() => setEditingRoom(room)} label="Edit" />
                    </div>
                  )}
                </div>
                
                {/* Description with Room Features/USP integrated */}
                {(room.description || room.room_features) && (
                  <div className="mb-6">
                    {room.description && (
                      <p className="text-muted-foreground mb-2">{room.description}</p>
                    )}
                    {room.room_features && (
                      <p className="text-muted-foreground text-sm">
                        <span className="font-medium text-foreground">Features: </span>
                        {room.room_features}
                      </p>
                    )}
                  </div>
                )}

                {/* Room Details */}
                <div className="flex flex-wrap gap-6 mb-6">
                  {room.max_guests && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-sm">
                        {room.adults_capacity && room.children_capacity && 
                         (room.adults_capacity + room.children_capacity <= room.max_guests) ? (
                          <>Up to {room.max_guests} guests (max {room.adults_capacity} adults, {room.children_capacity} children)</>
                        ) : (
                          <>Up to {room.max_guests} guests</>
                        )}
                      </span>
                    </div>
                  )}
                  {room.room_size_sqft && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Maximize className="w-5 h-5 text-primary" />
                      <span className="text-sm">{room.room_size_sqft} sq ft</span>
                    </div>
                  )}
                </div>

                {/* Room Amenities - Separate section */}
                {room.room_amenities && room.room_amenities.length > 0 && (
                  <div className="mb-6">
                    <RoomFeaturesSection 
                      roomFeatures={null}
                      roomAmenities={room.room_amenities}
                    />
                  </div>
                )}

                <Button variant="warm" size="lg" onClick={scrollToBooking}>
                  Book This Room
                </Button>
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
