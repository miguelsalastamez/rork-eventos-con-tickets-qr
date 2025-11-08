import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const removeDuplicatesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const attendees = await prisma.attendee.findMany({
      where: { eventId: input.eventId },
      orderBy: { createdAt: 'asc' },
    });

    const seen = new Map<string, string>();
    const toDelete: string[] = [];

    attendees.forEach((attendee: any) => {
      const key = `${attendee.email.toLowerCase()}-${attendee.employeeNumber.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.set(key, attendee.id);
      } else {
        toDelete.push(attendee.id);
      }
    });

    if (toDelete.length > 0) {
      await prisma.attendee.deleteMany({
        where: {
          id: {
            in: toDelete,
          },
        },
      });
    }

    return { removed: toDelete.length };
  });
