import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const getAttendeeByTicketRoute = publicProcedure
  .input(
    z.object({
      ticketCode: z.string(),
    })
  )
  .query(async ({ input }) => {
    const attendee = await prisma.attendee.findUnique({
      where: {
        ticketCode: input.ticketCode,
      },
      include: {
        event: true,
      },
    });

    return attendee;
  });
