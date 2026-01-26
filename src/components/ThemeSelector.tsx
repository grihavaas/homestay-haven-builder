"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeList, ThemeId } from "@/lib/themes";

export function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-elevated p-4 border border-border">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium block mb-3">
          Choose Theme
        </span>
        <div className="flex gap-2">
          {themeList.map((theme) => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme.id)}
              className={`relative w-10 h-10 rounded-full transition-all ${
                currentTheme === theme.id ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ background: theme.previewGradient }}
              title={theme.name}
            >
              {currentTheme === theme.id && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
