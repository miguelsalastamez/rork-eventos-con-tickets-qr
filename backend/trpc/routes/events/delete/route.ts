import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';
import { canUserDeleteEvent } from '../../../../lib/permissions';

export const deleteEventRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const event = await prisma.event.findUnique({
      where: { id: input.id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (!canUserDeleteEvent(ctx.user.id, event.createdBy, ctx.user.role)) {
      throw new Error('You do not have permission to delete this event');
    }

    await prisma.event.delete({
      where: { id: input.id },
    });

    return { success: true };
  });
