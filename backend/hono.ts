import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

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
  return c.json({ status: "ok", message: "API is running" });
});

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;
