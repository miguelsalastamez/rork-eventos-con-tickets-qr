import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const getEventRoute = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const event = await prisma.event.findUnique({
      where: {
        id: input.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        organization: true,
      },
    });

    return event;
  });
