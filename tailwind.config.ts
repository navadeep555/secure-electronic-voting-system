import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Import design tokens - convert to runtime values
const designTokens = {
  colors: {
    primary: {
      50: '#FFF0F3',
      100: '#FFE0E6',
      200: '#FFC2CD',
      300: '#FF94A8',
      400: '#F55D7A',
      500: '#D6264A',
      600: '#A6102E',
      700: '#850019',
      800: '#630014',
      900: '#45000E',
    },
    accent: {
      50: '#FFFAF0',
      100: '#FEEBC8',
      500: '#DD6B20',
      600: '#C05621',
      700: '#9C4221',
    },
    secondary: {
      50: '#F8FAFC',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
    },
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
    semantic: {
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626",
      info: "#2563EB",
    },
    foreground: {
      primary: "#0A0A0A",
      secondary: "#404040",
      tertiary: "#737373",
    },
    glow: {
      blue: "rgba(128, 0, 32, 0.15)",
      cyan: "rgba(153, 27, 27, 0.1)",
      purple: "rgba(180, 83, 9, 0.1)",
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
    "glow-blue": "0 0 30px rgba(128, 0, 32, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    "glow-cyan": "0 0 30px rgba(153, 27, 27, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    "glow-purple": "0 0 30px rgba(180, 83, 9, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    "hover-lift": "0 20px 40px rgba(128, 0, 32, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
  gradients: {
    primary: "linear-gradient(135deg, #A6102E 0%, #D6264A 100%)",
    accent: "linear-gradient(135deg, #DD6B20 0%, #F6AD55 100%)",
    background: "linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 50%, #F5F5F5 100%)",
    overlay: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)",
    glow: "linear-gradient(135deg, rgba(128, 0, 32, 0.2) 0%, rgba(153, 27, 27, 0.1) 100%)",
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
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
        elevated: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.06)",
        glow: "0 0 30px rgba(128, 0, 32, 0.3)",
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
