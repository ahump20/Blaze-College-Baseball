import type { Config } from 'tailwindcss';
import { colors, radius, space } from '@bsi/ui/tokens';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        foreground: colors.foreground,
        accent: colors.accent,
        border: colors.border,
        status: colors.status,
        overlay: colors.overlay
      },
      spacing: {
        ...space
      },
      borderRadius: {
        ...radius
      },
      boxShadow: {
        surface: `0 24px 64px -28px ${colors.overlay.DEFAULT}`
      }
    }
  },
  plugins: []
};

export default config;
