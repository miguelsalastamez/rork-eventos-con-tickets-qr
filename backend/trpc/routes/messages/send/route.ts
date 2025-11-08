import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const sendMessageRoute = protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      subject: z.string(),
      content: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const message = await prisma.message.create({
      data: {
        ...input,
        sentBy: ctx.user.id,
      },
    });

    return message;
  });
