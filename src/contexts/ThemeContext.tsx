"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, themes, ThemeConfig } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('homestay-theme');
      return (stored as ThemeId) || 'beach';
    }
    return 'beach';
  });

  useEffect(() => {
    localStorage.setItem('homestay-theme', currentTheme);
    // Apply theme class to document
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themeConfig: themes[currentTheme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
