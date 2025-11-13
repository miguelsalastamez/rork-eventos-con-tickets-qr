import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listWinnersRoute = publicProcedure
  .input(
    z.object({
      eventId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const winners = await prisma.raffleWinner.findMany({
      where: input?.eventId ? {
        eventId: input.eventId,
      } : undefined,
      include: {
        prize: true,
      },
      orderBy: {
        wonAt: 'desc',
      },
    });

    return winners;
  });
