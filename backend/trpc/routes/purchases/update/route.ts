import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const updatePurchaseRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'awaiting_transfer_confirmation', 'completed', 'cancelled', 'refunded']).optional(),
      paymentIntentId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;
    
    const data: any = updates;
    if (updates.status === 'completed' && !input.paymentIntentId) {
      data.confirmedAt = new Date();
    }
    
    const purchase = await prisma.purchase.update({
      where: { id },
      data,
    });

    return purchase;
  });
