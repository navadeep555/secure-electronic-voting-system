/**
 * Premium Design Tokens for SecureVote
 * Dark Futuristic Theme with Glassmorphism & Glow Effects
 */

// Color Palette
export const colors = {
  // Primary - Deep Blue with electric accent
  primary: {
    50: '#F0F4FF',
    100: '#E0E9FF',
    200: '#C2D4FF',
    300: '#A3BFFF',
    400: '#7FA3FF',
    500: '#5B87FF', // Main primary
    600: '#4A6FE8',
    700: '#3857D1',
    800: '#1F3BA8',
    900: '#0F1F7A',
  },
  
  // Accent - Vibrant Electric Purple/Cyan
  accent: {
    50: '#F0EDFF',
    100: '#E8E0FF',
    200: '#D1C2FF',
    300: '#B3A3FF',
    400: '#9B7FFF',
    500: '#8B5BFF', // Main accent
    600: '#7A4AE8',
    700: '#6838D1',
    800: '#4A1FA8',
    900: '#2D0F7A',
  },

  // Secondary - Cyan for highlights
  secondary: {
    50: '#F0FFFE',
    100: '#E0FFFF',
    200: '#C2FFFD',
    300: '#A3FFFB',
    400: '#7FFFF8',
    500: '#5BFFF5', // Main secondary
    600: '#4AEFF2',
    700: '#38D1DD',
    800: '#1FA8BA',
    900: '#0F7A8C',
  },

  // Neutral - Dark mode optimized
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E7E7E7',
    300: '#D1D1D1',
    400: '#A0A0A0',
    500: '#808080',
    600: '#606060',
    700: '#404040',
    800: '#252525',
    900: '#0A0A0A',
  },

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Dark background with gradient
  background: '#0F0F1E',
  backgroundSecondary: '#1A1A2E',
  backgroundTertiary: '#252540',
  
  // Foreground
  foreground: '#F5F5F5',
  foregroundSecondary: '#E0E0E0',
  foregroundTertiary: '#A0A0A0',

  // Glass effect
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    dark: 'rgba(255, 255, 255, 0.03)',
  },

  // Glow effects
  glow: {
    blue: 'rgba(91, 135, 255, 0.3)',
    cyan: 'rgba(91, 255, 245, 0.2)',
    purple: 'rgba(139, 91, 255, 0.3)',
  },
};

// Typography Scale
export const typography = {
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing Scale (8px base)
export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  full: '9999px',
};

// Shadows (Depth System)
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.2)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.4)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  '2xl': '0 40px 80px -20px rgb(0 0 0 / 0.6)',
  
  // Glass shadow (subtle)
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  
  // Glow shadows
  'glow-blue': '0 0 20px rgba(91, 135, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  'glow-cyan': '0 0 20px rgba(91, 255, 245, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  'glow-purple': '0 0 20px rgba(139, 91, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  
  // Hover shadows
  'hover-lift': '0 20px 40px rgba(91, 135, 255, 0.2), 0 0 40px rgba(91, 135, 255, 0.1)',
};

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Spring-like easing
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Backdrop filters (Glassmorphism)
export const backdrop = {
  sm: 'backdrop-blur(10px)',
  md: 'backdrop-blur(20px)',
  lg: 'backdrop-blur(40px)',
};

// Gradients
export const gradients = {
  // Primary gradient
  primary: 'linear-gradient(135deg, #5B87FF 0%, #8B5BFF 100%)',
  
  // Accent gradient
  accent: 'linear-gradient(135deg, #8B5BFF 0%, #5BFFF5 100%)',
  
  // Background gradient
  background: 'linear-gradient(135deg, #0F0F1E 0%, #1A1A2E 50%, #252540 100%)',
  
  // Overlay gradient
  overlay: 'linear-gradient(180deg, rgba(15, 15, 30, 0.1) 0%, rgba(15, 15, 30, 0.8) 100%)',
  
  // Glow gradient
  glow: 'radial-gradient(circle, rgba(91, 135, 255, 0.4) 0%, transparent 70%)',
};

// Z-index scale
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
};

// Animation durations (for Framer Motion)
export const animationDurations = {
  instant: 0,
  micro: 0.15,
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1,
};

// Animation delays
export const animationDelays = {
  none: 0,
  micro: 0.05,
  sm: 0.1,
  md: 0.15,
  lg: 0.2,
  xl: 0.3,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  backdrop,
  gradients,
  zIndex,
  animationDurations,
  animationDelays,
};
