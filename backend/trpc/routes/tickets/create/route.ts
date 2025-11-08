import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createTicketRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
      currency: z.string().default('MXN'),
      capacityType: z.enum(['unlimited', 'dedicated', 'shared']),
      dedicatedCapacity: z.number().optional(),
      sharedCapacityPoolId: z.string().optional(),
      saleStartDate: z.string(),
      saleEndDate: z.string(),
      isActive: z.boolean().default(true),
      formFields: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const ticket = await prisma.ticket.create({
      data: {
        ...input,
        saleStartDate: new Date(input.saleStartDate),
        saleEndDate: new Date(input.saleEndDate),
      },
    });

    return ticket;
  });
