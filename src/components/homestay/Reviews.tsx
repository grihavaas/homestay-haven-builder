import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { propertyData } from "@/lib/propertyData";

export function Reviews() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="reviews" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
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
            <div className="text-center md:text-left">
              <div className="text-6xl font-serif font-bold text-primary">
                {propertyData.ratings.overall}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(propertyData.ratings.overall)
                        ? "text-gold fill-gold"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mt-2">
                Based on {propertyData.ratings.totalReviews} reviews
              </p>
            </div>

            {/* Right - Breakdown */}
            <div className="space-y-3">
              {Object.entries(propertyData.ratings.breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground capitalize w-24">
                    {key}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${(value / 5) * 100}%` } : {}}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Guests loved:</p>
            <div className="flex flex-wrap gap-2">
              {propertyData.ratings.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="px-3 py-1 text-sm bg-sage/10 text-sage rounded-full"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Review Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {propertyData.reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-soft relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                "{review.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {review.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {review.author}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {review.location} • {review.date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Review Sources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-border"
        >
          {propertyData.ratings.sources.map((source) => (
            <div key={source.name} className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="font-medium text-foreground">{source.rating}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {source.name} ({source.reviews})
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
