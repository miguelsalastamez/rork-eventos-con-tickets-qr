import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listPrizesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const prizes = await prisma.prize.findMany({
      where: input?.eventId ? {
        eventId: input.eventId,
      } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prizes;
  });
