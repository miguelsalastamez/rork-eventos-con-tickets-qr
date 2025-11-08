import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listCapacityPoolsRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const pools = await prisma.capacityPool.findMany({
      where: {
        eventId: input.eventId,
      },
      include: {
        tickets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pools;
  });
