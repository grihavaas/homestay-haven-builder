"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemedContent } from "@/components/ThemedContent";
import { ThemeSelector } from "@/components/ThemeSelector";

export default function HomePage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <ThemedContent />
        <ThemeSelector />
      </div>
    </ThemeProvider>
  );
}
