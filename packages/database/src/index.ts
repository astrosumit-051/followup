// Import Prisma Client types for local use
import { PrismaClient as PrismaClientType } from '@prisma/client';

// Re-export Prisma Client and all generated types and enums
export { PrismaClient, Prisma } from '@prisma/client';
export type * from '@prisma/client';

// Re-export enums as values (not types) so they can be used at runtime
export {
  EmailStatus,
  TemplateType,
  Direction,
} from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClientType };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientType({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
