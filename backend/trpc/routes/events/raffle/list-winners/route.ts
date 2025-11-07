import { protectedProcedure } from "@/backend/trpc/create-context";
import { canViewEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const listRaffleWinnersRoute = protectedProcedure
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
        message: 'No tienes permiso para ver los ganadores',
      });
    }

    const winners = await prisma.raffleWinner.findMany({
      where: { eventId: input.eventId },
      include: {
        prize: true,
      },
      orderBy: {
        wonAt: 'desc',
      },
    });

    return winners.map((winner: any) => ({
      ...winner,
      wonAt: winner.wonAt.toISOString(),
      prize: {
        ...winner.prize,
        createdAt: winner.prize.createdAt.toISOString(),
      },
    }));
  });

export default listRaffleWinnersRoute;
