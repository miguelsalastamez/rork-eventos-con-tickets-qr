import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import loginRoute from "./routes/auth/login/route";
import registerRoute from "./routes/auth/register/route";
import meRoute from "./routes/auth/me/route";
import createTestUserRoute from "./routes/auth/create-test-user/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    login: loginRoute,
    register: registerRoute,
    me: meRoute,
    createTestUser: createTestUserRoute,
  }),
});

export type AppRouter = typeof appRouter;
