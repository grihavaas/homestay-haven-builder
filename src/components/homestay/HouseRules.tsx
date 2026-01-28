import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Clock,
  Ban,
  Volume2,
  Users,
  PawPrint,
  PartyPopper,
  CreditCard,
} from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HouseRulesEditor } from "@/components/edit-mode/editors/HouseRulesEditor";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Ban,
  Volume2,
  Users,
  PawPrint,
  PartyPopper,
  CreditCard,
};

export function HouseRules() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [showEditor, setShowEditor] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (loading || !property) {
    return null;
  }

  // Filter for house_rules only
  const houseRules = property.rules_and_policies?.filter((rule: any) => rule.rule_type === 'house_rules') || [];

  // In edit mode, show section even without rules so user can add them
  if (!isEditMode && houseRules.length === 0) {
    return null;
  }
  
  const getIcon = (ruleType: string) => {
    // Map rule types to icons
    const iconMapByType: Record<string, React.ComponentType<{ className?: string }>> = {
      house_rules: Clock,
      check_in_requirements: Clock,
      cancellation: Ban,
      terms: CreditCard,
      privacy: Users,
    };
    return iconMapByType[ruleType] || Clock;
  };

  return (
    <section id="rules" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Important Information
            </span>
            <div className="flex items-center justify-center gap-2 mt-3 mb-4">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground">
                House Rules
              </h2>
              <EditButton onClick={() => setShowEditor(true)} />
            </div>
            <p className="text-muted-foreground">
              To ensure a comfortable stay for all our guests, please observe these guidelines.
            </p>
          </div>

          {houseRules.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {houseRules.map((rule: any, index: number) => {
                const Icon = getIcon(rule.rule_type);
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-card rounded-xl p-5 shadow-soft"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground">{rule.rule_text}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : isEditMode ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No house rules added yet. Click the edit button to add rules.</p>
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* House Rules Editor */}
      <HouseRulesEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
