import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const deleteAllRaffleWinnersRoute = protectedProcedure
  .input(z.object({ eventId: z.string() }))
  .mutation(async ({ ctx, input }) => {
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

    if (!canEditEvent(user, event)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para eliminar ganadores',
      });
    }

    const result = await prisma.raffleWinner.deleteMany({
      where: { eventId: input.eventId },
    });

    return { count: result.count };
  });

export default deleteAllRaffleWinnersRoute;
