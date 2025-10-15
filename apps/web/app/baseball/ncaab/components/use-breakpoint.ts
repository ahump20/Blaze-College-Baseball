'use client';

import { useEffect, useState } from 'react';

export function useIsMobile(maxWidth = 640) {
  const initial = typeof window !== 'undefined' ? window.innerWidth <= maxWidth : false;
  const [isMobile, setIsMobile] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const query = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener('change', update);

    return () => {
      query.removeEventListener('change', update);
    };
  }, [maxWidth]);

  return isMobile;
}
