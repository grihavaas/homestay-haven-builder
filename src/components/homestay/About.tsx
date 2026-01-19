import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, Leaf, Award, Heart } from "lucide-react";
import { propertyData } from "@/lib/propertyData";

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Welcome to Our Estate
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-6">
              A Heritage Home in the Heart of Coffee Country
            </h2>
            <div className="prose prose-lg text-muted-foreground">
              <p className="leading-relaxed">
                {propertyData.description.split('\n\n')[0]}
              </p>
              <p className="leading-relaxed mt-4">
                {propertyData.description.split('\n\n')[1]}
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {propertyData.features.highlights.slice(0, 4).map((highlight, index) => (
                <motion.div
                  key={highlight}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{highlight}</span>
                </motion.div>
              ))}
            </div>
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
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl font-serif font-semibold text-primary">80+</div>
                <div className="text-sm text-muted-foreground mt-1">Years of Heritage</div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl font-serif font-semibold text-primary">
                  {propertyData.ratings.overall}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Guest Rating</div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl font-serif font-semibold text-primary">5</div>
                <div className="text-sm text-muted-foreground mt-1">Acres of Estate</div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="text-4xl font-serif font-semibold text-primary">
                  {propertyData.ratings.totalReviews}+
                </div>
                <div className="text-sm text-muted-foreground mt-1">Happy Guests</div>
              </div>
            </div>

            {/* Awards */}
            <div className="bg-gradient-sage rounded-xl p-6 text-accent-foreground">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5" />
                <span className="font-medium">Awards & Recognition</span>
              </div>
              <ul className="space-y-2">
                {propertyData.features.awards.map((award) => (
                  <li key={award} className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {award}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sustainability */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-sage" />
                <span className="font-medium text-foreground">Eco-Friendly Practices</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {propertyData.features.sustainability.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-3 py-1 bg-sage/10 text-sage rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
