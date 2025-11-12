let PrismaClient: any;
let prismaInstance: any = null;
let connectionError: Error | null = null;
let prismaClientAvailable = false;

try {
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
  prismaClientAvailable = true;
} catch (error) {
  console.error('❌ Failed to import @prisma/client');
  console.error('   This usually means Prisma Client has not been generated.');
  console.error('   Run: bunx prisma generate');
  console.error('   Error:', (error as Error).message);
  prismaClientAvailable = false;
}

if (prismaClientAvailable) {
  const globalForPrisma = global as unknown as { prisma: any };
  
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not configured. Database features will be disabled.');
      console.warn('⚠️  To enable database features:');
      console.warn('   1. Copy env.example to .env');
      console.warn('   2. Configure DATABASE_URL');
      console.warn('   3. Run: bunx prisma generate');
      console.warn('   4. Run: bunx prisma migrate dev');
    } else {
      try {
        prismaInstance =
          globalForPrisma.prisma ||
          new PrismaClient({
            log: ['error', 'warn'],
          });
        
        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prismaInstance;
        }
        
        console.log('✅ Prisma Client initialized successfully');
      } catch (initError) {
        connectionError = initError as Error;
        console.error('❌ Failed to initialize Prisma Client:', (initError as Error).message);
        prismaInstance = null;
      }
    }
  } catch (error) {
    connectionError = error as Error;
    console.error('❌ Unexpected error during Prisma initialization:', error);
    console.warn('⚠️  Database features will be disabled.');
    prismaInstance = null;
  }
}

export const prisma = prismaInstance;

export function isDatabaseConnected(): boolean {
  return prismaInstance !== null && !!process.env.DATABASE_URL && prismaClientAvailable;
}

export function getDatabaseError(): Error | null {
  return connectionError;
}

export function hasPrismaClient(): boolean {
  return prismaClientAvailable;
}
