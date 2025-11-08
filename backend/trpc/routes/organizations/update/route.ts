import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const updateOrganizationRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;
    
    const organization = await prisma.organization.update({
      where: { id },
      data: updates,
    });

    return organization;
  });
