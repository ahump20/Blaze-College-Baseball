import { prisma } from './prisma';
import type { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

type UserUpsertInput = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

export async function upsertUserFromClerk(payload: UserUpsertInput) {
  const { id, email, firstName, lastName, imageUrl } = payload;

  await prisma.user.upsert({
    where: { id },
    create: {
      id,
      email,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      imageUrl: imageUrl ?? undefined
    },
    update: {
      email,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      imageUrl: imageUrl ?? undefined
    }
  });

  await prisma.subscription.upsert({
    where: { userId: id },
    create: {
      userId: id
    },
    update: {}
  });
}

export async function setUserSubscriptionTier(
  userId: string,
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
  currentPeriodEnd?: Date | null
) {
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd: currentPeriodEnd ?? undefined
    },
    update: {
      tier,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd: currentPeriodEnd ?? undefined
    }
  });
}

export function buildDefaultAlerts() {
  return {
    gameStart: true,
    finalScore: true,
    recruiting: false,
    breakingNews: false,
    nightlyDigest: false
  };
}
