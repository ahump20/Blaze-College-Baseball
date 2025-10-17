'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type SubscriptionTier = 'FREE' | 'PRO';
export type SubscriptionStatus = 'INACTIVE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

export type FavoriteTeam = {
  id: string;
  teamSlug: string;
  teamName?: string | null;
  conference?: string | null;
};

export type AlertPreferences = {
  gameStart: boolean;
  finalScore: boolean;
  recruiting: boolean;
  breakingNews: boolean;
  nightlyDigest: boolean;
};

export type SubscriptionContextValue = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  isPro: boolean;
  favorites: FavoriteTeam[];
  alerts: AlertPreferences;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ value, children }: { value: SubscriptionContextValue; children: ReactNode }) {
  const memoized = useMemo(() => value, [value]);
  return <SubscriptionContext.Provider value={memoized}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);

  if (!ctx) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }

  return ctx;
}

export function useIsPro() {
  return useSubscription().isPro;
}
