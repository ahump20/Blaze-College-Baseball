import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const cdtNow = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).formatToParts(new Date()).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  let offset = '-05:00';
  const tzName = parts.timeZoneName || '';
  if (tzName === 'CST') offset = '-06:00';
  else if (tzName.startsWith('GMT')) {
    const raw = tzName.replace('GMT', '');
    offset = raw.includes(':') ? raw : `${raw}:00`;
  }

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
};

const initialState = {
  version: '0.0.1',
  sessionId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}`,
  environment: 'production',
  currentSport: 'Baseball',
  filters: {
    season: '2025-2026',
    region: 'Texas',
    league: null
  },
  validationMetrics: {
    totalValidations: 0,
    failures: 0,
    lastValidationCdt: null
  },
  cacheMetrics: {
    hits: 0,
    misses: 0,
    hitRate: 1
  },
  checkpoints: []
};

const useSportsStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      setEnvironment: (environment) => set({ environment }),
      setCurrentSport: (currentSport) => set({ currentSport }),
      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),
      recordValidation: (success) =>
        set((state) => {
          const totalValidations = state.validationMetrics.totalValidations + 1;
          const failures = state.validationMetrics.failures + (success ? 0 : 1);
          return {
            validationMetrics: {
              totalValidations,
              failures,
              lastValidationCdt: cdtNow()
            }
          };
        }),
      recordCacheHit: (hit) =>
        set((state) => {
          const hits = state.cacheMetrics.hits + (hit ? 1 : 0);
          const misses = state.cacheMetrics.misses + (hit ? 0 : 1);
          const hitRate = hits / Math.max(1, hits + misses);
          return {
            cacheMetrics: {
              hits,
              misses,
              hitRate
            }
          };
        }),
      resetMetrics: () =>
        set((state) => ({
          validationMetrics: {
            totalValidations: 0,
            failures: 0,
            lastValidationCdt: null
          },
          cacheMetrics: {
            hits: 0,
            misses: 0,
            hitRate: 1
          },
          checkpoints: state.checkpoints
        })),
      createCheckpoint: () => {
        const snapshot = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `chk_${Date.now()}`,
          createdAtCdt: cdtNow(),
          state: {
            currentSport: get().currentSport,
            filters: get().filters,
            validationMetrics: get().validationMetrics,
            cacheMetrics: get().cacheMetrics
          }
        };
        set((state) => ({
          checkpoints: [...state.checkpoints, snapshot].slice(-10)
        }));
        return snapshot.id;
      },
      recoverFromCheckpoint: (checkpointId) => {
        const checkpoint = get().checkpoints.find((item) => item.id === checkpointId);
        if (!checkpoint) {
          return false;
        }
        set({
          currentSport: checkpoint.state.currentSport,
          filters: checkpoint.state.filters,
          validationMetrics: checkpoint.state.validationMetrics,
          cacheMetrics: checkpoint.state.cacheMetrics
        });
        return true;
      }
    }),
    {
      name: 'bsi-storage',
      version: 1,
      partialize: (state) => ({
        sessionId: state.sessionId,
        currentSport: state.currentSport,
        filters: state.filters,
        validationMetrics: state.validationMetrics,
        cacheMetrics: state.cacheMetrics
      })
    }
  )
);

export default useSportsStore;
