"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PropertyProvider>
            <ThemeProvider>
              <EditModeProvider>
                <Toaster />
                <Sonner />
                {children}
              </EditModeProvider>
            </ThemeProvider>
          </PropertyProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
