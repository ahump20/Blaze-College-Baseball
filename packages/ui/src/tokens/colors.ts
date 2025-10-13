/**
 * Brand color tokens shared across Blaze Sports Intel surfaces.
 * Dark mode is the default experience, so the base background leans navy/graphite.
 */
export const colors = {
  background: {
    DEFAULT: '#0b1120',
    muted: '#111827',
    surface: '#1a202c',
    elevated: '#2d3748'
  },
  foreground: {
    DEFAULT: '#e2e8f0',
    muted: '#94a3b8',
    subtle: '#cbd5f5'
  },
  accent: {
    gold: '#fbbf24',
    crimson: '#dc2626',
    sky: '#38bdf8'
  },
  border: {
    DEFAULT: '#273248',
    strong: '#3b445c',
    muted: '#1f2937'
  },
  status: {
    success: '#22c55e',
    warning: '#facc15',
    danger: '#f87171',
    info: '#38bdf8'
  },
  overlay: {
    DEFAULT: 'rgba(11, 17, 32, 0.85)'
  }
} as const;

export type Colors = typeof colors;
