import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    const mql: MediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addListener(listener) {
        listeners.push(listener);
      },
      removeListener(listener) {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      },
      addEventListener(_type, listener) {
        listeners.push(listener as (event: MediaQueryListEvent) => void);
      },
      removeEventListener(_type, listener) {
        const index = listeners.indexOf(listener as (event: MediaQueryListEvent) => void);
        if (index >= 0) listeners.splice(index, 1);
      },
      dispatchEvent(event) {
        listeners.forEach((listener) => listener(event));
        return true;
      }
    } as MediaQueryList;
    return mql;
  }
});
