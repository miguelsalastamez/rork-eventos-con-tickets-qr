import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listPrizesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const prizes = await prisma.prize.findMany({
      where: {
        eventId: input.eventId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prizes;
  });
