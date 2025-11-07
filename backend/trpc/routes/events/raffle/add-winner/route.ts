import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const addRaffleWinnerRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      prizeId: z.string(),
      attendeeId: z.string(),
    })
  )
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
        message: 'No tienes permiso para gestionar el sorteo',
      });
    }

    const winner = await prisma.raffleWinner.create({
      data: input,
    });

    return {
      ...winner,
      wonAt: winner.wonAt.toISOString(),
    };
  });

export default addRaffleWinnerRoute;
