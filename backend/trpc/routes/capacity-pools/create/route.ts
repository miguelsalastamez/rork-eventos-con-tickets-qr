import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createCapacityPoolRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      name: z.string(),
      totalCapacity: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const pool = await prisma.capacityPool.create({
      data: input,
    });

    return pool;
  });
