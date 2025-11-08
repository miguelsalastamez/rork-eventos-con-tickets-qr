import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createMultipleAttendeesRoute = protectedProcedure
  .input(
    z.object({
      attendees: z.array(
        z.object({
          eventId: z.string(),
          fullName: z.string(),
          email: z.string().email(),
          employeeNumber: z.string(),
          ticketCode: z.string(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const attendees = await prisma.attendee.createMany({
      data: input.attendees,
      skipDuplicates: true,
    });

    return attendees;
  });
