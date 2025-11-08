import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const checkInAttendeeRoute = protectedProcedure
  .input(
    z.object({
      attendeeId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const attendee = await prisma.attendee.update({
      where: {
        id: input.attendeeId,
      },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });

    return attendee;
  });
