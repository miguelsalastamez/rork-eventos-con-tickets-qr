import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listEventsRoute = protectedProcedure
  .input(
    z
      .object({
        organizationId: z.string().optional(),
        userId: z.string().optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const where: any = {};

    if (ctx.user.role === 'super_admin') {
    } else if (input?.organizationId) {
      where.organizationId = input.organizationId;
    } else if (input?.userId) {
      where.createdBy = input.userId;
    } else {
      where.createdBy = ctx.user.id;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        date: 'desc',
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

    return events;
  });
