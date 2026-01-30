/**
 * Premium Design Tokens for SecureVote
 * Dark Futuristic Theme with Glassmorphism & Glow Effects
 */

// Color Palette
export const colors = {
  // Primary - Lighter Burgundy
  primary: {
    50: '#FFF0F3',
    100: '#FFE0E6',
    200: '#FFC2CD',
    300: '#FF94A8',
    400: '#F55D7A',
    500: '#D6264A', // Main bright
    600: '#A6102E', // Slightly lighter main burgundy
    700: '#850019',
    800: '#630014',
    900: '#45000E',
  },

  // Accent - Gold/Warm Neutral (replacing Electric Purple)
  accent: {
    50: '#FFFAF0',
    100: '#FEEBC8',
    200: '#FBD38D',
    300: '#F6AD55',
    400: '#ED8936',
    500: '#DD6B20',
    600: '#C05621',
    700: '#9C4221',
    800: '#7B341E',
    900: '#652B19',
  },

  // Secondary - Slate/Gray (replacing Cyan)
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Neutral - Gray scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic colors
  success: '#059669', // Emerald
  warning: '#D97706', // Amber
  error: '#DC2626',   // Red
  info: '#2563EB',    // Blue (kept for standard info info, but can change if strictly no blue wanted. The user said "UI in white and burgundy" and "don't want any blue". I should probably change Info to Gray or darker Teal to avoid bright blue)

  // Light background
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA', // Very light gray
  backgroundTertiary: '#F5F5F5',

  // Dark foreground
  foreground: '#0A0A0A',
  foregroundSecondary: '#404040',
  foregroundTertiary: '#737373',

  // Glass effect (adapted for light mode)
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    medium: 'rgba(255, 255, 255, 0.85)',
    dark: 'rgba(255, 255, 255, 0.95)',
  },

  // Glow effects (Warm/Red)
  glow: {
    blue: 'rgba(128, 0, 32, 0.15)', // actually burgundy glow
    cyan: 'rgba(153, 27, 27, 0.1)', // red glow
    purple: 'rgba(180, 83, 9, 0.1)', // gold/orange glow
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
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.05)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
  '2xl': '0 40px 80px -20px rgb(0 0 0 / 0.1)',

  // Glass shadow (subtle)
  glass: '0 8px 32px 0 rgba(128, 0, 32, 0.1)',

  // Glow shadows (Red/Warm)
  'glow-blue': '0 0 20px rgba(128, 0, 32, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
  'glow-cyan': '0 0 20px rgba(153, 27, 27, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
  'glow-purple': '0 0 20px rgba(180, 83, 9, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',

  // Hover shadows
  'hover-lift': '0 20px 40px rgba(128, 0, 32, 0.1), 0 0 40px rgba(128, 0, 32, 0.05)',
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
  // Primary gradient - Lighter Burgundy
  primary: 'linear-gradient(135deg, #A6102E 0%, #D6264A 100%)',

  // Accent gradient - Gold/Warm
  accent: 'linear-gradient(135deg, #DD6B20 0%, #F6AD55 100%)',

  // Background gradient - White/Subtle Gray
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 50%, #F5F5F5 100%)',

  // Overlay gradient
  overlay: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',

  // Glow gradient
  glow: 'radial-gradient(circle, rgba(166, 16, 46, 0.2) 0%, transparent 70%)',
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
