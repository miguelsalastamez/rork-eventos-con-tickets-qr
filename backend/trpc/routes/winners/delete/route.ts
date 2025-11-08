import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const deleteWinnerRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await prisma.raffleWinner.delete({
      where: { id: input.id },
    });

    return { success: true };
  });
