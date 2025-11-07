import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const addManyAttendeesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      attendees: z.array(
        z.object({
          fullName: z.string(),
          email: z.string(),
          employeeNumber: z.string(),
          ticketCode: z.string(),
        })
      ),
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

    const attendeesData = input.attendees.map((a) => ({
      ...a,
      eventId: input.eventId,
    }));

    const result = await prisma.attendee.createMany({
      data: attendeesData,
      skipDuplicates: true,
    });

    return { count: result.count };
  });

export default addManyAttendeesRoute;
