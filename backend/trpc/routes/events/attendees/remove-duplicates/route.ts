import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const removeDuplicatesRoute = protectedProcedure
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
        message: 'No tienes permiso para eliminar duplicados',
      });
    }

    const attendees = await prisma.attendee.findMany({
      where: { eventId: input.eventId },
      orderBy: { createdAt: 'asc' },
    });

    const seen = new Map<string, string>();
    const duplicateIds: string[] = [];

    for (const attendee of attendees) {
      const key = `${attendee.email.toLowerCase()}-${attendee.employeeNumber.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.set(key, attendee.id);
      } else {
        duplicateIds.push(attendee.id);
      }
    }

    if (duplicateIds.length > 0) {
      await prisma.attendee.deleteMany({
        where: {
          id: { in: duplicateIds },
        },
      });
    }

    return { count: duplicateIds.length };
  });

export default removeDuplicatesRoute;
