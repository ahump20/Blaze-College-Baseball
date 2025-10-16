import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SubscriptionProvider, useSubscription } from '@/components/subscription-context';

describe('SubscriptionProvider', () => {
  it('provides subscription context to consumers', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SubscriptionProvider
        value={{
          tier: 'PRO',
          status: 'ACTIVE',
          isPro: true,
          favorites: [],
          alerts: {
            gameStart: true,
            finalScore: true,
            recruiting: false,
            breakingNews: true,
            nightlyDigest: false
          }
        }}
      >
        {children}
      </SubscriptionProvider>
    );

    const { result } = renderHook(() => useSubscription(), { wrapper });

    expect(result.current.isPro).toBe(true);
    expect(result.current.tier).toBe('PRO');
    expect(result.current.alerts.breakingNews).toBe(true);
  });
});
