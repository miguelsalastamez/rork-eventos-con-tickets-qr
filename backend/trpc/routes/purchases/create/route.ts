import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createPurchaseRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      ticketId: z.string(),
      ticketName: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalAmount: z.number(),
      currency: z.string(),
      buyerEmail: z.string().email(),
      buyerFullName: z.string(),
      buyerPhone: z.string().optional(),
      formData: z.any().optional(),
      paymentMethod: z.enum(['stripe', 'transfer']),
      paymentIntentId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: input.ticketId },
      include: { pool: true },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.capacityType === 'dedicated') {
      if (ticket.soldCount + input.quantity > (ticket.dedicatedCapacity || 0)) {
        throw new Error('Not enough capacity');
      }
    }

    if (ticket.capacityType === 'shared' && ticket.pool) {
      if (ticket.pool.usedCapacity + input.quantity > ticket.pool.totalCapacity) {
        throw new Error('Not enough capacity');
      }
    }

    const purchase = await prisma.purchase.create({
      data: {
        ...input,
        userId: ctx.user.id,
        status: input.paymentMethod === 'transfer' ? 'awaiting_transfer_confirmation' : 'pending',
      },
    });

    await prisma.ticket.update({
      where: { id: input.ticketId },
      data: {
        soldCount: {
          increment: input.quantity,
        },
      },
    });

    if (ticket.capacityType === 'shared' && ticket.sharedCapacityPoolId) {
      await prisma.capacityPool.update({
        where: { id: ticket.sharedCapacityPoolId },
        data: {
          usedCapacity: {
            increment: input.quantity,
          },
        },
      });
    }

    return purchase;
  });
