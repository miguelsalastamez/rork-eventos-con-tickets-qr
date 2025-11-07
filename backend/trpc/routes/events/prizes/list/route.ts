import { protectedProcedure } from "@/backend/trpc/create-context";
import { canViewEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const listPrizesRoute = protectedProcedure
  .input(z.object({ eventId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { user, prisma } = ctx;

    const event = await prisma.event.findUnique({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Evento no encontrado',
      });
    }

    if (!canViewEvent(user, event)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para ver los premios',
      });
    }

    const prizes = await prisma.prize.findMany({
      where: { eventId: input.eventId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prizes.map((prize: any) => ({
      ...prize,
      createdAt: prize.createdAt.toISOString(),
    }));
  });

export default listPrizesRoute;
