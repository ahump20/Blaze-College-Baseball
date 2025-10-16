export type ConferenceCode = 'all' | 'sec' | 'acc' | 'big12' | 'pac12' | 'big10';

export const colors = {
  background: '#1A202C',
  surface: '#2D3748',
  mutedSurface: '#1F2736',
  accentGold: '#FBBF24',
  accentCrimson: '#DC2626',
  textPrimary: '#E2E8F0',
  textSecondary: '#A0AEC0',
  border: '#4A5568',
  success: '#10B981',
  warning: '#F59E0B'
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem'
};

export const radii = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  full: '9999px'
};

export const fonts = {
  sans: 'var(--font-inter)',
  serif: 'var(--font-source-serif)'
};

export const theme = {
  colors,
  spacing,
  radii,
  fonts
};
