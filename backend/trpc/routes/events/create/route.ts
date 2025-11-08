import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createEventRoute = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      date: z.string(),
      time: z.string(),
      venueName: z.string(),
      location: z.string(),
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
      organizationId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const event = await prisma.event.create({
      data: {
        ...input,
        date: new Date(input.date),
        createdBy: ctx.user.id,
      },
    });

    return event;
  });
