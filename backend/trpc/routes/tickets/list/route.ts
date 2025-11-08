import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listTicketsRoute = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
      availableOnly: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    const where: any = {
      eventId: input.eventId,
    };

    if (input.availableOnly) {
      where.isActive = true;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        pool: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (input.availableOnly) {
      const now = new Date();
      return tickets.filter((ticket: any) => {
        const saleStart = new Date(ticket.saleStartDate);
        const saleEnd = new Date(ticket.saleEndDate);
        
        if (now < saleStart || now > saleEnd) return false;
        
        if (ticket.capacityType === 'unlimited') return true;
        
        if (ticket.capacityType === 'dedicated') {
          return ticket.soldCount < (ticket.dedicatedCapacity || 0);
        }
        
        if (ticket.capacityType === 'shared' && ticket.pool) {
          return ticket.pool.usedCapacity < ticket.pool.totalCapacity;
        }
        
        return false;
      });
    }

    return tickets;
  });
