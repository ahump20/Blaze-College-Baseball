import { test, expect } from '@playwright/test';
import { deriveDashboardFeatureState } from '@/lib/subscription-helpers';

test('free users see upgrade prompts instead of pro analytics', async () => {
  const state = deriveDashboardFeatureState('FREE', 'INACTIVE');

  expect(state.showUpgradeCta).toBeTruthy();
  expect(state.showProAnalytics).toBeFalsy();
});

test('pro users unlock premium analytics modules', async () => {
  const state = deriveDashboardFeatureState('PRO', 'ACTIVE');

  expect(state.showProAnalytics).toBeTruthy();
  expect(state.showUpgradeCta).toBeFalsy();
});
