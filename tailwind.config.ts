import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Import design tokens - convert to runtime values
const designTokens = {
  colors: {
    primary: {
      50: "#f0f4ff",
      100: "#e0e8ff",
      200: "#c1d1ff",
      300: "#a2baff",
      400: "#7a98ff",
      500: "#5b87ff",
      600: "#4a6aff",
      700: "#3d55ff",
      800: "#2d3fa6",
      900: "#1e2969",
    },
    accent: {
      50: "#faf0ff",
      100: "#f5e0ff",
      500: "#8b5bff",
      600: "#7a48ff",
      700: "#6835ff",
    },
    secondary: {
      50: "#f0fffe",
      500: "#5bfff5",
      600: "#2ffff0",
      700: "#00ffe9",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },
    semantic: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    foreground: {
      primary: "#f5f5f5",
      secondary: "#d4d4d4",
      tertiary: "#a3a3a3",
    },
    glow: {
      blue: "rgba(91, 135, 255, 0.5)",
      cyan: "rgba(91, 255, 245, 0.3)",
      purple: "rgba(139, 91, 255, 0.4)",
    },
  },
  borderRadius: {
    xs: "0.25rem",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
  },
  shadows: {
    "glow-blue": "0 0 30px rgba(91, 135, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    "glow-cyan": "0 0 30px rgba(91, 255, 245, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    "glow-purple": "0 0 30px rgba(139, 91, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    "hover-lift": "0 20px 40px rgba(91, 135, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
  gradients: {
    primary: "linear-gradient(135deg, #5b87ff 0%, #8b5bff 100%)",
    accent: "linear-gradient(135deg, #8b5bff 0%, #5bfff5 100%)",
    background: "linear-gradient(135deg, #0f0f1e 0%, #252540 100%)",
    overlay: "linear-gradient(135deg, rgba(91, 135, 255, 0.1) 0%, rgba(139, 91, 255, 0.1) 100%)",
    glow: "linear-gradient(135deg, rgba(91, 135, 255, 0.2) 0%, rgba(91, 255, 245, 0.1) 100%)",
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
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        // Premium color palette
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
        "secondary-50": colors.secondary[50],
        "secondary-500": colors.secondary[500],
        "secondary-600": colors.secondary[600],
        "secondary-700": colors.secondary[700],
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
        // Legacy support
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xs: borderRadius.xs,
        sm: borderRadius.sm,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        "2xl": borderRadius["2xl"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "slide-down": "slide-down 0.3s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      boxShadow: {
        "glow-blue": shadows["glow-blue"],
        "glow-cyan": shadows["glow-cyan"],
        "glow-purple": shadows["glow-purple"],
        "hover-lift": shadows["hover-lift"],
        card: "0 4px 6px -1px hsl(222 47% 11% / 0.08), 0 2px 4px -2px hsl(222 47% 11% / 0.05)",
        elevated: "0 10px 15px -3px hsl(222 47% 11% / 0.1), 0 4px 6px -4px hsl(222 47% 11% / 0.05)",
        glow: "0 0 30px hsl(192 82% 45% / 0.3)",
      },
      backdropFilter: {
        glass: "blur(10px)",
        "glass-xl": "blur(16px)",
      },
      backgroundImage: {
        "gradient-primary": gradients.primary,
        "gradient-accent": gradients.accent,
        "gradient-background": gradients.background,
        "gradient-overlay": gradients.overlay,
        "gradient-glow": gradients.glow,
      },
      transitionDuration: {
        instant: "50ms",
        micro: "100ms",
        fast: "200ms",
        base: "300ms",
        slow: "500ms",
        slower: "800ms",
        slowest: "1200ms",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
