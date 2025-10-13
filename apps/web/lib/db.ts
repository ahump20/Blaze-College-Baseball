import { PrismaClient } from '@prisma/client';

export type PrismaClientLike = Pick<PrismaClient, 'game' | 'team' | 'player' | 'conference' | 'ranking' | 'stripeEvent'>;

type GlobalPrisma = PrismaClientLike & PrismaClient;

const globalObject = globalThis as unknown as {
  __bsiPrisma?: GlobalPrisma;
};

export function setPrismaClient(client: PrismaClientLike) {
  globalObject.__bsiPrisma = client as GlobalPrisma;
}

export function resetPrismaClient() {
  if (globalObject.__bsiPrisma && globalObject.__bsiPrisma instanceof PrismaClient) {
    void globalObject.__bsiPrisma.$disconnect().catch(() => {
      // Swallow disconnect errors in test environments.
    });
  }
  delete globalObject.__bsiPrisma;
}

export function getPrismaClient(): PrismaClientLike {
  if (globalObject.__bsiPrisma) {
    return globalObject.__bsiPrisma;
  }

  const client = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalObject.__bsiPrisma = client as GlobalPrisma;
  }
  return client;
}
