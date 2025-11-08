import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listMessagesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const messages = await prisma.message.findMany({
      where: {
        eventId: input.eventId,
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return messages;
  });
