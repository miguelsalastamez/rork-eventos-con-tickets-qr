import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const deleteAllWinnersRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const result = await prisma.raffleWinner.deleteMany({
      where: {
        eventId: input.eventId,
      },
    });

    return result;
  });
