"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, themes, ThemeConfig } from '@/lib/themes';
import { useProperty } from './PropertyContext';

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { property } = useProperty();
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('mountain');

  // Sync theme from property when it loads
  useEffect(() => {
    if (property?.theme && themes[property.theme as ThemeId]) {
      setCurrentTheme(property.theme as ThemeId);
    }
  }, [property?.theme]);

  useEffect(() => {
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
