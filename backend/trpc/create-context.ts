import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "@/backend/lib/prisma";
import { verifyToken } from "@/backend/lib/auth";
import type { User } from "@/types";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let user: User | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      const dbUser = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          fullName: dbUser.fullName,
          phone: dbUser.phone || undefined,
          role: dbUser.role as User['role'],
          organizationId: dbUser.organizationId || undefined,
          createdAt: dbUser.createdAt.toISOString(),
        };
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      if (error instanceof Error && error.message.includes('expirado')) {
        console.error('Token expired - user needs to login again');
      }
    }
  }

  return {
    req: opts.req,
    user,
    prisma,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Debes iniciar sesión' });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  });
});
