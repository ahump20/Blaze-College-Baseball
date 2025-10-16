import type { Config } from "tailwindcss";
import { colors, fonts } from "./styles/theme";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./styles/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        surface: colors.surface,
        "surface-muted": colors.surfaceMuted,
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5F5",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        "brand-gold": colors.gold,
        "brand-crimson": colors.crimson,
      },
      fontFamily: {
        sans: [fonts.sans, "Inter", "system-ui", "sans-serif"],
        serif: [fonts.serif, "Source Serif Pro", "serif"],
      },
      boxShadow: {
        shell: "0 25px 65px -45px rgba(251,191,36,0.45)",
      },
      borderRadius: {
        xl: "1.5rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
