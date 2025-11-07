import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const getAttendeeByCodeRoute = protectedProcedure
  .input(z.object({ ticketCode: z.string() }))
  .query(async ({ ctx, input }) => {
    const { prisma } = ctx;

    const attendee = await prisma.attendee.findUnique({
      where: { ticketCode: input.ticketCode },
      include: {
        event: true,
      },
    });

    if (!attendee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Asistente no encontrado',
      });
    }

    return {
      ...attendee,
      createdAt: attendee.createdAt.toISOString(),
      checkedInAt: attendee.checkedInAt?.toISOString(),
      event: {
        ...attendee.event,
        date: attendee.event.date.toISOString(),
        createdAt: attendee.event.createdAt.toISOString(),
        updatedAt: attendee.event.updatedAt.toISOString(),
      },
    };
  });

export default getAttendeeByCodeRoute;
