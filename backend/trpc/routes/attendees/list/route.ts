import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listAttendeesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const attendees = await prisma.attendee.findMany({
      where: input?.eventId ? {
        eventId: input.eventId,
      } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return attendees;
  });
