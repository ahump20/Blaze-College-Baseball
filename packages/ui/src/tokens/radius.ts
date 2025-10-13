/** Corner radii used across components. */
export const radius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  pill: '999px'
} as const;

export type RadiusScale = typeof radius;
