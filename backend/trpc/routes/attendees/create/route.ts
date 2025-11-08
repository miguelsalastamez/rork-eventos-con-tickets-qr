import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createAttendeeRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      fullName: z.string(),
      email: z.string().email(),
      employeeNumber: z.string(),
      ticketCode: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const attendee = await prisma.attendee.create({
      data: input,
    });

    return attendee;
  });
