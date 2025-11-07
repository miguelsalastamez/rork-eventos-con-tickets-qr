import { protectedProcedure } from "@/backend/trpc/create-context";
import { canEditEvent } from "@/backend/lib/permissions";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
    const { user, prisma } = ctx;
    const { id, ...updates } = input;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Evento no encontrado',
      });
    }

    if (!canEditEvent(user, event)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para editar este evento',
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...updates,
        date: updates.date ? new Date(updates.date) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      ...updatedEvent,
      date: updatedEvent.date.toISOString(),
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString(),
    };
  });

export default updateEventRoute;
