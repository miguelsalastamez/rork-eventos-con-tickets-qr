import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createMultipleWinnersRoute = protectedProcedure
  .input(
    z.object({
      winners: z.array(
        z.object({
          eventId: z.string(),
          prizeId: z.string(),
          attendeeId: z.string(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const winners = await prisma.raffleWinner.createMany({
      data: input.winners,
    });

    return winners;
  });
