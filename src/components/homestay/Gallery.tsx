import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";

import heroImage from "@/assets/hero-homestay.jpg";

export function Gallery() {
  const { property, loading } = useProperty();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  if (loading || !property) {
    return null;
  }
  
  // Get gallery images from media
  // Schema: media_type is primary (hero, gallery, room_image, video, host_image)
  // category is optional (exterior, common_area, surrounding, seasonal, etc.)
  const galleryImages = property.media?.filter((m: any) => 
    m.media_type === 'gallery' && !m.room_id // Only property-level gallery images, not room images
  ).map((m: any) => ({
    src: m.s3_url,
    alt: m.alt_text || m.title || "Gallery image",
    category: m.category || "Gallery"
  })) || [];
  
  if (galleryImages.length === 0) {
    return null; // Don't show gallery if no images
  }

  return (
    <>
      <section id="gallery" className="py-20 md:py-32 bg-cream-dark">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Photo Gallery
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
              Glimpses of Serenity
            </h2>
            <p className="text-muted-foreground">
              Explore our property through the lens – from misty morning views to cozy evening firesides.
            </p>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image: { src: string; alt: string; category: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                  index === 0 ? "col-span-2 row-span-2" : ""
                }`}
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                    index === 0 ? "aspect-[4/3] md:aspect-square" : "aspect-square"
                  }`}
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-end p-4">
                  <span className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                    {image.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-primary-foreground hover:text-primary transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Gallery"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </motion.div>
      )}
    </>
  );
}
