import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const addPrizeRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      quantity: z.number().default(1),
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
        message: 'No tienes permiso para agregar premios',
      });
    }

    const prize = await prisma.prize.create({
      data: input,
    });

    return {
      ...prize,
      createdAt: prize.createdAt.toISOString(),
    };
  });

export default addPrizeRoute;
