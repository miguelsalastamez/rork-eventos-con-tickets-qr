import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const deletePrizeRoute = protectedProcedure
  .input(z.object({ prizeId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { user, prisma } = ctx;

    const prize = await prisma.prize.findUnique({
      where: { id: input.prizeId },
      include: { event: true },
    });

    if (!prize) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Premio no encontrado',
      });
    }

    if (!canEditEvent(user, prize.event)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para eliminar premios',
      });
    }

    await prisma.prize.delete({
      where: { id: input.prizeId },
    });

    return { success: true };
  });

export default deletePrizeRoute;
