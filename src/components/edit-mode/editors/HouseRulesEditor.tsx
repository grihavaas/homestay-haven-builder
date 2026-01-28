"use client";

import { useState, useEffect } from "react";
import {
  BottomSheet,
  BottomSheetField,
  BottomSheetActions,
} from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";

interface HouseRulesEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Rule {
  id?: string;
  rule_text: string;
  display_order: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

export function HouseRulesEditor({ isOpen, onClose }: HouseRulesEditorProps) {
  const { property } = useProperty();
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);

  // Initialize rules when property loads or editor opens
  useEffect(() => {
    if (property && isOpen) {
      const houseRules = property.rules_and_policies
        ?.filter((r: any) => r.rule_type === "house_rules")
        ?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        ?.map((r: any) => ({
          id: r.id,
          rule_text: r.rule_text || "",
          display_order: r.display_order || 0,
        })) || [];

      setRules(houseRules.length > 0 ? houseRules : [{ rule_text: "", display_order: 0, isNew: true }]);
    }
  }, [property, isOpen]);

  const addRule = () => {
    const maxOrder = Math.max(...rules.map((r) => r.display_order), -1);
    setRules([...rules, { rule_text: "", display_order: maxOrder + 1, isNew: true }]);
  };

  const removeRule = (index: number) => {
    const rule = rules[index];
    if (rule.id) {
      // Mark existing rule as deleted
      setRules(rules.map((r, i) => (i === index ? { ...r, isDeleted: true } : r)));
    } else {
      // Remove new rule entirely
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  const updateRule = (index: number, text: string) => {
    setRules(rules.map((r, i) => (i === index ? { ...r, rule_text: text } : r)));
  };

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Delete marked rules
      const toDelete = rules.filter((r) => r.isDeleted && r.id);
      for (const rule of toDelete) {
        const { error } = await supabase
          .from("rules_and_policies")
          .delete()
          .eq("id", rule.id);
        if (error) throw error;
      }

      // Update existing rules
      const toUpdate = rules.filter((r) => !r.isNew && !r.isDeleted && r.id && r.rule_text.trim());
      for (const rule of toUpdate) {
        const { error } = await supabase
          .from("rules_and_policies")
          .update({
            rule_text: rule.rule_text.trim(),
            display_order: rule.display_order,
          })
          .eq("id", rule.id);
        if (error) throw error;
      }

      // Insert new rules
      const toInsert = rules.filter((r) => r.isNew && !r.isDeleted && r.rule_text.trim());
      if (toInsert.length > 0) {
        const { error } = await supabase.from("rules_and_policies").insert(
          toInsert.map((r) => ({
            property_id: property.id,
            rule_type: "house_rules",
            rule_text: r.rule_text.trim(),
            display_order: r.display_order,
          }))
        );
        if (error) throw error;
      }

      toast({
        title: "Saved",
        description: "House rules updated successfully.",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const visibleRules = rules.filter((r) => !r.isDeleted);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit House Rules">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add rules and guidelines for your guests to follow during their stay.
        </p>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {visibleRules.map((rule, index) => {
            const actualIndex = rules.findIndex((r) => r === rule);
            return (
              <div key={rule.id || `new-${index}`} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  value={rule.rule_text}
                  onChange={(e) => updateRule(actualIndex, e.target.value)}
                  placeholder="e.g., No smoking on the premises"
                  className="text-base flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(actualIndex)}
                  className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addRule}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>

        <BottomSheetActions>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </BottomSheetActions>
      </div>
    </BottomSheet>
  );
}
