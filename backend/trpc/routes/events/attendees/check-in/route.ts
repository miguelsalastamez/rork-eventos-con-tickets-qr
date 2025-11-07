import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const checkInAttendeeRoute = protectedProcedure
  .input(z.object({ attendeeId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { user, prisma } = ctx;

    const attendee = await prisma.attendee.findUnique({
      where: { id: input.attendeeId },
      include: { event: true },
    });

    if (!attendee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Asistente no encontrado',
      });
    }

    if (!canEditEvent(user, attendee.event)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para hacer check-in',
      });
    }

    const updated = await prisma.attendee.update({
      where: { id: input.attendeeId },
      data: {
        checkedIn: !attendee.checkedIn,
        checkedInAt: !attendee.checkedIn ? new Date() : null,
      },
    });

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      checkedInAt: updated.checkedInAt?.toISOString(),
    };
  });

export default checkInAttendeeRoute;
