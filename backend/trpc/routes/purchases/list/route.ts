import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listPurchasesRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string().optional(),
      userId: z.string().optional(),
      buyerEmail: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const where: any = {};

    if (input.eventId) {
      where.eventId = input.eventId;
    }

    if (input.userId) {
      where.userId = input.userId;
    } else if (!input.eventId && ctx.user.role !== 'super_admin') {
      where.userId = ctx.user.id;
    }

    if (input.buyerEmail) {
      where.buyerEmail = input.buyerEmail;
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            venueName: true,
          },
        },
        ticket: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    return purchases;
  });
