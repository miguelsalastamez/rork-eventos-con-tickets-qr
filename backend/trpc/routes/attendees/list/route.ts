import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listAttendeesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const attendees = await prisma.attendee.findMany({
      where: {
        eventId: input.eventId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return attendees;
  });
