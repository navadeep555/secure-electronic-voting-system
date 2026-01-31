import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// ═══════════════════════════════════════════════════════════════
// NATIONAL ELECTION PORTAL - DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
// MOOD: Elegant, Civic, Professional, Trustworthy
// COLORS: Burgundy, Deep Maroon, Charcoal, Soft Gold, White
// ═══════════════════════════════════════════════════════════════

const designTokens = {
  colors: {
    // BURGUNDY - The Authority Color
    primary: {
      50: "#fcf4f4",
      100: "#f9e8e8",
      200: "#f0d5d5",
      300: "#e6b0b0",
      400: "#d67d7d",
      500: "#bc4c4c", // Base Red (for errors/alerts)
      600: "#a33232",
      700: "#800020", // The "Burgundy" Core
      800: "#600018", // Deep Wine
      900: "#4a0404", // Darkest Maroon
      950: "#2a0202",
    },
    // GOLD / BRASS - The Prestige Accent
    accent: {
      50: "#fbf9f4",
      100: "#f6f2e6",
      200: "#eae0cc",
      300: "#dac6a3",
      400: "#c5a059", // Soft Gold
      500: "#b08d4b",
      600: "#997b3d", // Antique Brass
      700: "#7a6231",
      800: "#5e4b26",
      900: "#42351b",
    },
    // OFF-WHITE / PAPER - The "Document" Feel
    secondary: {
      50: "#f9fafb",
      100: "#f3f4f6", // Paper
      200: "#e5e7eb", // Light Border
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151", // Charcoal Light
      800: "#1f2937", // Charcoal Dark
      900: "#111827", // Almost Black
    },
    neutral: {
      50: "#ffffff",
      100: "#fafafa",
      200: "#f4f4f5", // Light Gray Background
      300: "#e4e4e7",
      400: "#d4d4d8",
      500: "#a1a1aa",
      600: "#71717a",
      700: "#52525b",
      800: "#3f3f46", // Dark Gray Text
      900: "#27272a", // Black Text
    },
    // Semantic Colors (Standardized)
    semantic: {
      success: "#166534", // Dark Green
      warning: "#92400e", // Dark Amber
      error: "#991b1b",   // Dark Red
      info: "#1e3a8a",    // Dark Blue (Only for utility/info, not theme)
    },
    foreground: {
      primary: "#111827",   // Near Black
      secondary: "#374151", // Dark Gray
      tertiary: "#6b7280",  // Medium Gray
    },
  },
  borderRadius: {
    xs: "0rem",     // Sharp
    sm: "0.125rem", // Very slight
    md: "0.25rem",  // Slight
    lg: "0.375rem", // Standard
    xl: "0.5rem",   // Max for cards
    "2xl": "0.5rem", // Cap at 0.5rem
    "3xl": "0.5rem", // Cap at 0.5rem
    full: "9999px",
  },
  shadows: {
    "card": "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)", // Subtle document shadow
    "card-hover": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    "elevated": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    // REPLACING GLOWS WITH SUBTLE SHADOWS
    "glow-blue": "none",
    "glow-cyan": "none",
    "glow-purple": "none",
    "hover-lift": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  gradients: {
    // ELIMINATING NEON GRADIENTS
    primary: "linear-gradient(to bottom, #800020, #600018)", // Burgundy Gradient
    accent: "linear-gradient(to bottom, #c5a059, #997b3d)",  // Gold Gradient
    background: "linear-gradient(to bottom, #ffffff, #f9fafb)", // Paper Gradient
    overlay: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.9))",
    glow: "none",
  },
};

const { colors, borderRadius, shadows, gradients } = designTokens;

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px", // More contained, readable width
      },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"], // Perfect for "Official" titles
      },
      colors: {
        // Mapping token colors
        "primary-50": colors.primary[50],
        "primary-100": colors.primary[100],
        "primary-200": colors.primary[200],
        "primary-300": colors.primary[300],
        "primary-400": colors.primary[400],
        "primary-500": colors.primary[500],
        "primary-600": colors.primary[600],
        "primary-700": colors.primary[700],
        "primary-800": colors.primary[800],
        "primary-900": colors.primary[900],

        "accent-50": colors.accent[50],
        "accent-100": colors.accent[100],
        "accent-500": colors.accent[500],
        "accent-600": colors.accent[600],
        "accent-700": colors.accent[700],

        "neutral-50": colors.neutral[50],
        "neutral-100": colors.neutral[100],
        "neutral-200": colors.neutral[200],
        "neutral-300": colors.neutral[300],
        "neutral-400": colors.neutral[400],
        "neutral-500": colors.neutral[500],
        "neutral-600": colors.neutral[600],
        "neutral-700": colors.neutral[700],
        "neutral-800": colors.neutral[800],
        "neutral-900": colors.neutral[900],

        "semantic-success": colors.semantic.success,
        "semantic-warning": colors.semantic.warning,
        "semantic-error": colors.semantic.error,
        "semantic-info": colors.semantic.info,

        "foreground-primary": colors.foreground.primary,
        "foreground-secondary": colors.foreground.secondary,
        "foreground-tertiary": colors.foreground.tertiary,

        // shadcn/ui overrides
        border: colors.secondary[200],
        input: colors.secondary[200],
        ring: colors.primary[700], // Burgundy ring
        background: colors.neutral[50], // White
        foreground: colors.neutral[900], // Black text

        primary: {
          DEFAULT: colors.primary[700], // Burgundy
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: colors.secondary[100], // Light Gray
          foreground: colors.neutral[900],
        },
        destructive: {
          DEFAULT: colors.semantic.error,
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: colors.secondary[100],
          foreground: colors.secondary[500],
        },
        accent: {
          DEFAULT: colors.accent[400], // Gold
          foreground: colors.neutral[900],
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: colors.neutral[900],
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: colors.neutral[900],
        },
        success: {
          DEFAULT: colors.semantic.success,
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: colors.semantic.warning,
          foreground: "#ffffff",
        },
        info: {
          DEFAULT: colors.semantic.info,
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        xs: borderRadius.xs,
        sm: borderRadius.sm,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        "2xl": borderRadius["2xl"],
        "3xl": borderRadius["3xl"],
        // Specific override for "clean" UI
        DEFAULT: borderRadius.md,
      },
      boxShadow: {
        "card": shadows.card,
        "card-hover": shadows["card-hover"],
        "elevated": shadows.elevated,
        // Remove glows
        "glow-blue": "none",
        "glow-cyan": "none",
        "glow-purple": "none",
        "glow": "none",
      },
      backgroundImage: {
        "gradient-primary": gradients.primary,
        "gradient-accent": gradients.accent,
        "gradient-background": gradients.background,
        "gradient-overlay": gradients.overlay,
        "hero-pattern": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      // SLOW DOWN ANIMATIONS for "Serious" feel
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards", // Slower
        "slide-up": "slideUp 0.8s ease-out forwards",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        medium: "300ms",
        slow: "500ms",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
