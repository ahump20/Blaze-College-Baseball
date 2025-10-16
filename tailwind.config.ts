import type { Config } from 'tailwindcss';
import { colors, spacing, radii, fonts } from './styles/theme';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './styles/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        surface: colors.surface,
        'surface-muted': colors.mutedSurface,
        accent: colors.accentGold,
        crimson: colors.accentCrimson,
        text: colors.textPrimary,
        'text-muted': colors.textSecondary,
        border: colors.border,
        success: colors.success,
        warning: colors.warning
      },
      spacing,
      borderRadius: {
        ...radii
      },
      fontFamily: {
        sans: [fonts.sans],
        serif: [fonts.serif]
      },
      boxShadow: {
        card: '0 24px 48px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
