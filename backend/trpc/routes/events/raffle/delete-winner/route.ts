import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const deleteRaffleWinnerRoute = protectedProcedure
  .input(z.object({ winnerId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { user, prisma } = ctx;

    const winner = await prisma.raffleWinner.findUnique({
      where: { id: input.winnerId },
      include: { event: true },
    });

    if (!winner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ganador no encontrado',
      });
    }

    if (!canEditEvent(user, winner.event)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para eliminar ganadores',
      });
    }

    await prisma.raffleWinner.delete({
      where: { id: input.winnerId },
    });

    return { success: true };
  });

export default deleteRaffleWinnerRoute;
