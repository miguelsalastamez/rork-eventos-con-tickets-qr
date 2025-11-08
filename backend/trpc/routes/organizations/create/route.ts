import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createOrganizationRoute = protectedProcedure
  .input(
    z.object({
      name: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const organization = await prisma.organization.create({
      data: input,
    });

    return organization;
  });
