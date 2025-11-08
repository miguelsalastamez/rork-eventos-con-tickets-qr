import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createWinnerRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      prizeId: z.string(),
      attendeeId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const winner = await prisma.raffleWinner.create({
      data: input,
    });

    return winner;
  });
