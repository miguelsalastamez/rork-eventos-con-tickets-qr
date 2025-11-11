import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

let prismaInstance: PrismaClient | null = null;

try {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not configured. Database features will be disabled.');
    console.warn('⚠️  To enable database features:');
    console.warn('   1. Copy env.example to .env');
    console.warn('   2. Configure DATABASE_URL');
    console.warn('   3. Run: bunx prisma migrate dev');
  } else {
    prismaInstance =
      globalForPrisma.prisma ||
      new PrismaClient({
        log: ['error', 'warn'],
      });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
  }
} catch (error) {
  console.error('❌ Failed to initialize Prisma Client:', error);
  console.warn('⚠️  Database features will be disabled.');
  prismaInstance = null;
}

export const prisma = prismaInstance as PrismaClient;

export function isDatabaseConnected(): boolean {
  return prismaInstance !== null && !!process.env.DATABASE_URL;
}
