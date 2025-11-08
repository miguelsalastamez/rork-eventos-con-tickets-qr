import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';
import { canUserEditEvent } from '../../../../lib/permissions';

export const updateEventRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      time: z.string().optional(),
      venueName: z.string().optional(),
      location: z.string().optional(),
      imageUrl: z.string().optional(),
      organizerLogoUrl: z.string().optional(),
      venuePlanUrl: z.string().optional(),
      employeeNumberLabel: z.string().optional(),
      successSoundId: z.string().optional(),
      errorSoundId: z.string().optional(),
      vibrationEnabled: z.boolean().optional(),
      vibrationIntensity: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const event = await prisma.event.findUnique({
      where: { id: input.id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (!canUserEditEvent(ctx.user.id, event.createdBy, ctx.user.role)) {
      throw new Error('You do not have permission to edit this event');
    }

    const { id, ...updates } = input;
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...updates,
        date: updates.date ? new Date(updates.date) : undefined,
      },
    });

    return updatedEvent;
  });
