// Theme definitions for 5 environment-based variants
export type ThemeId = 'beach' | 'mountain' | 'forest' | 'backwater' | 'adventure';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  previewGradient: string;
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'classic' | 'bold' | 'minimal' | 'editorial' | 'dynamic';
}

export const themes: Record<ThemeId, ThemeConfig> = {
  beach: {
    id: 'beach',
    name: 'Coastal Escape',
    tagline: 'Sun, sand & serenity',
    description: 'Light, airy layouts with ocean-inspired colors. Features horizontal flow, full-width imagery, and breezy typography.',
    previewGradient: 'linear-gradient(135deg, #87CEEB, #F5DEB3)',
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    layout: 'classic',
  },
  mountain: {
    id: 'mountain',
    name: 'Alpine Retreat',
    tagline: 'Peaks & tranquility',
    description: 'Bold, dramatic layouts with deep earth tones. Features strong vertical elements, layered cards, and rugged textures.',
    previewGradient: 'linear-gradient(135deg, #4A5568, #718096)',
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    layout: 'bold',
  },
  forest: {
    id: 'forest',
    name: 'Woodland Haven',
    tagline: 'Nature\'s embrace',
    description: 'Organic, immersive layouts with lush greens. Features asymmetric grids, natural borders, and earthy warmth.',
    previewGradient: 'linear-gradient(135deg, #2D5016, #4A7C23)',
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    layout: 'editorial',
  },
  backwater: {
    id: 'backwater',
    name: 'Tranquil Waters',
    tagline: 'Calm & connected',
    description: 'Serene, flowing layouts with water-inspired palettes. Features horizontal scrolling sections and reflective imagery.',
    previewGradient: 'linear-gradient(135deg, #1E4D4D, #3D8B8B)',
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    layout: 'minimal',
  },
  adventure: {
    id: 'adventure',
    name: 'Wild Explorer',
    tagline: 'Thrill & discovery',
    description: 'Dynamic, energetic layouts with bold contrasts. Features diagonal elements, action-focused imagery, and vibrant accents.',
    previewGradient: 'linear-gradient(135deg, #D97706, #DC2626)',
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    layout: 'dynamic',
  },
};

export const themeList = Object.values(themes);
