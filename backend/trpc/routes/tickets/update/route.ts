import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const updateTicketRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      price: z.number().optional(),
      currency: z.string().optional(),
      capacityType: z.enum(['unlimited', 'dedicated', 'shared']).optional(),
      dedicatedCapacity: z.number().optional(),
      sharedCapacityPoolId: z.string().optional(),
      saleStartDate: z.string().optional(),
      saleEndDate: z.string().optional(),
      isActive: z.boolean().optional(),
      formFields: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;
    
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...updates,
        saleStartDate: updates.saleStartDate ? new Date(updates.saleStartDate) : undefined,
        saleEndDate: updates.saleEndDate ? new Date(updates.saleEndDate) : undefined,
      },
    });

    return ticket;
  });
