'use client';

import { useEffect, useState } from 'react';

const queries: Record<'sm' | 'md', string> = {
  sm: '(max-width: 767px)',
  md: '(max-width: 1023px)'
};

export function useBreakpoint(breakpoint: 'sm' | 'md'): boolean {
  const query = queries[breakpoint];
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }

    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();

    if ('addEventListener' in media) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, [query]);

  return matches;
}
