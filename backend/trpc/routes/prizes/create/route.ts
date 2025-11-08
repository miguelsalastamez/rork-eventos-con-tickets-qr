import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createPrizeRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      quantity: z.number().default(1),
    })
  )
  .mutation(async ({ input }) => {
    const prize = await prisma.prize.create({
      data: input,
    });

    return prize;
  });
