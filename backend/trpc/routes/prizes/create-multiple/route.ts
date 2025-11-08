import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createMultiplePrizesRoute = protectedProcedure
  .input(
    z.object({
      prizes: z.array(
        z.object({
          eventId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          quantity: z.number().default(1),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const prizes = await prisma.prize.createMany({
      data: input.prizes,
    });

    return prizes;
  });
