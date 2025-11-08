import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const checkInAllRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const result = await prisma.attendee.updateMany({
      where: {
        eventId: input.eventId,
        checkedIn: false,
      },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });

    return result;
  });
