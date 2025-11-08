import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const updateCapacityPoolRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      totalCapacity: z.number().optional(),
      usedCapacity: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;
    
    const pool = await prisma.capacityPool.update({
      where: { id },
      data: updates,
    });

    return pool;
  });
