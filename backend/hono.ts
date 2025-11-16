import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { isDatabaseConnected } from "./lib/prisma";

const app = new Hono();

console.log('\n' + '='.repeat(50));
console.log('🚀 BACKEND SERVER STARTING');
console.log('='.repeat(50));
console.log('📦 Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 Database URL configured:', !!process.env.DATABASE_URL);
console.log('💾 Database connected:', isDatabaseConnected());
console.log('🔐 JWT Secret configured:', !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-secret-key-change-this');

if (!process.env.DATABASE_URL) {
  console.warn('\n⚠️  WARNING: DATABASE_URL not configured!');
  console.warn('   To fix this:');
  console.warn('   1. Copy env.example to .env');
  console.warn('   2. Configure your DATABASE_URL');
  console.warn('   3. Run: bunx prisma migrate dev\n');
}

if (!isDatabaseConnected()) {
  console.error('\n❌ Database connection FAILED');
  console.error('   Server will start but most endpoints will not work.\n');
} else {
  console.log('\n✅ All systems ready!');
}

console.log('='.repeat(50) + '\n');

app.use("*", cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error('=== tRPC ERROR ===');
      console.error('Path:', path);
      console.error('Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error cause:', error.cause);
    },
  })
);

app.onError((err, c) => {
  console.error('=== SERVER ERROR ===');
  console.error('Error:', err);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  return c.json({ 
    error: {
      message: err.message || 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    }
  }, 500);
});

app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is running",
    database: isDatabaseConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (c) => {
  return c.json({ 
    status: "ok",
    database: isDatabaseConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

const port = process.env.PORT || 8081;

const server = Bun.serve({
  port: Number(port),
  fetch: app.fetch,
});

console.log(`🚀 Server running on http://localhost:${port}`);
console.log(`🔌 API endpoint: http://localhost:${port}/api`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);

export default server;
