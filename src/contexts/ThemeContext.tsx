"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, themes, ThemeConfig, PaletteId, palettes, PaletteConfig, defaultPaletteForTheme } from '@/lib/themes';
import { useProperty } from './PropertyContext';

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themeConfig: ThemeConfig;
  currentPalette: PaletteId;
  setPalette: (palette: PaletteId) => void;
  paletteConfig: PaletteConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { property } = useProperty();
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('mountain');
  const [currentPalette, setCurrentPalette] = useState<PaletteId>('slate');

  // Sync theme and palette from property when it loads
  useEffect(() => {
    if (property?.theme && themes[property.theme as ThemeId]) {
      const themeId = property.theme as ThemeId;
      setCurrentTheme(themeId);

      // Use explicit palette if set, otherwise fall back to theme's default
      if (property.palette && palettes[property.palette as PaletteId]) {
        setCurrentPalette(property.palette as PaletteId);
      } else {
        setCurrentPalette(defaultPaletteForTheme[themeId]);
      }
    }
  }, [property?.theme, property?.palette]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', currentPalette);
  }, [currentPalette]);

  const setTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
  };

  const setPalette = (palette: PaletteId) => {
    setCurrentPalette(palette);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themeConfig: themes[currentTheme],
        currentPalette,
        setPalette,
        paletteConfig: palettes[currentPalette],
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
