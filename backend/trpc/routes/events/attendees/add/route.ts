import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const addAttendeeRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      fullName: z.string(),
      email: z.string(),
      employeeNumber: z.string(),
      ticketCode: z.string(),
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
        message: 'No tienes permiso para agregar asistentes',
      });
    }

    const attendee = await prisma.attendee.create({
      data: input,
    });

    return {
      ...attendee,
      createdAt: attendee.createdAt.toISOString(),
      checkedInAt: attendee.checkedInAt?.toISOString(),
    };
  });

export default addAttendeeRoute;
