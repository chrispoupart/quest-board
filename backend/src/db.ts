import { PrismaClient } from '@prisma/client';

// This prevents the client from being initialized multiple times in development
// due to hot reloading.
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  global.prisma = prisma;
}
