import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CheckCircle, Leaf, Award, Heart } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { AboutEditor } from "@/components/edit-mode/editors/AboutEditor";

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [showEditor, setShowEditor] = useState(false);

  if (loading || !property) {
    return null;
  }
  
  const showFeatures = property?.feature_property_features ?? false;
  const descriptionParts = property.description?.split('\n\n') || [];

  return (
    <section id="about" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Use property_history if available, otherwise use property name */}
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              {property.property_history ? "Welcome to Our Estate" : `About ${property.name}`}
            </span>
            <div className="relative inline-block">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-6">
                {property.property_history || property.name}
              </h2>
              {isEditMode && (
                <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                  <EditButton onClick={() => setShowEditor(true)} label="Edit" />
                </div>
              )}
            </div>
            <div className="prose prose-lg text-muted-foreground">
              {descriptionParts.map((part: string, idx: number) => (
                <p key={idx} className={`leading-relaxed ${idx > 0 ? 'mt-4' : ''}`}>
                  {part}
                </p>
              ))}
            </div>

            {/* Highlights */}
            {showFeatures && property.property_features && property.property_features.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                {property.property_features.slice(0, 4).map((feature: any, index: number) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature.description}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Stats & Awards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const avgRating = property.review_sources?.length > 0
                  ? property.review_sources.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / property.review_sources.length
                  : 0;
                const totalReviews = property.review_sources?.reduce((sum: number, r: any) => sum + (r.total_reviews || 0), 0) || 0;
                return (
                  <>
                    {avgRating > 0 && (
                      <div className="bg-card rounded-xl p-6 shadow-soft">
                        <div className="text-4xl font-serif font-semibold text-primary">
                          {avgRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Guest Rating</div>
                      </div>
                    )}
                    {totalReviews > 0 && (
                      <div className="bg-card rounded-xl p-6 shadow-soft">
                        <div className="text-4xl font-serif font-semibold text-primary">
                          {totalReviews}+
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Happy Guests</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Awards and Sustainability sections removed - not in current schema */}
          </motion.div>
        </div>
      </div>

      {/* About Editor Bottom Sheet */}
      <AboutEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
