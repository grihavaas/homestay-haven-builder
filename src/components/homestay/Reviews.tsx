import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, Quote } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { ReviewsEditor } from "@/components/edit-mode/editors/ReviewsEditor";

export function Reviews() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (loading || !property) {
    return null;
  }
  
  // Calculate average rating
  const avgRating = property.review_sources?.length > 0
    ? property.review_sources.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / property.review_sources.length
    : 0;
  const totalReviews = property.review_sources?.reduce((sum: number, r: any) => sum + (r.total_reviews || 0), 0) || 0;

  return (
    <>
      <section id="reviews" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center max-w-2xl mx-auto mb-16 relative"
          >
            {isEditMode && (
              <div className="absolute -top-2 -right-2 z-10">
                <EditButton onClick={() => setIsEditorOpen(true)} label="Edit Reviews" />
              </div>
            )}
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Guest Reviews
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
              What Our Guests Say
            </h2>
            <p className="text-muted-foreground">
              Don't just take our word for it – hear from travelers who've experienced the magic of Serenity Hills.
            </p>
          </motion.div>

        {/* Overall Rating */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-8 shadow-card max-w-4xl mx-auto mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Score */}
            {avgRating > 0 && (
              <div className="text-center md:text-left">
                <div className="text-6xl font-serif font-bold text-primary">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(avgRating)
                          ? "text-gold fill-gold"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                {totalReviews > 0 && (
                  <p className="text-muted-foreground mt-2">
                    Based on {totalReviews} reviews
                  </p>
                )}
              </div>
            )}

            {/* Right - Review Sources */}
            {property.review_sources && property.review_sources.length > 0 && (
              <div className="space-y-3">
                {property.review_sources.map((source: any) => (
                  <div key={source.id} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground capitalize w-24">
                      {source.site_name}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${((source.stars || 0) / 5) * 100}%` } : {}}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8">
                      {source.stars?.toFixed(1) || '0'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Review Sources Summary */}
        {property.review_sources && property.review_sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-border"
          >
            {property.review_sources.map((source: any) => (
              <div key={source.id} className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="font-medium text-foreground">{source.stars?.toFixed(1) || '0'}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {source.site_name} {source.total_reviews ? `(${source.total_reviews})` : ''}
                </div>
                {source.review_url && (
                  <a
                    href={source.review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 block"
                  >
                    View Reviews
                  </a>
                )}
              </div>
            ))}
          </motion.div>
        )}
        </div>
      </section>

      <ReviewsEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </>
  );
}
