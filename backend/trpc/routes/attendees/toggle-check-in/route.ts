import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const toggleCheckInRoute = protectedProcedure
  .input(
    z.object({
      attendeeId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const attendee = await prisma.attendee.findUnique({
      where: { id: input.attendeeId },
    });

    if (!attendee) {
      throw new Error('Attendee not found');
    }

    const updated = await prisma.attendee.update({
      where: { id: input.attendeeId },
      data: {
        checkedIn: !attendee.checkedIn,
        checkedInAt: !attendee.checkedIn ? new Date() : null,
      },
    });

    return updated;
  });
