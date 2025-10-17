import type { SubscriptionStatus, SubscriptionTier } from '@prisma/client';

export function isProActive(tier: SubscriptionTier | undefined, status: SubscriptionStatus | undefined) {
  return tier === 'PRO' && status === 'ACTIVE';
}

export type DashboardFeatureState = {
  showProAnalytics: boolean;
  showUpgradeCta: boolean;
};

export function deriveDashboardFeatureState(tier: SubscriptionTier | undefined, status: SubscriptionStatus | undefined): DashboardFeatureState {
  const pro = isProActive(tier, status);

  return {
    showProAnalytics: pro,
    showUpgradeCta: !pro
  };
}
