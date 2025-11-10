import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const createOrganizationRoute = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
      coverUrl: z.string().optional(),
      website: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const slugExists = await prisma.organization.findUnique({
      where: { slug: input.slug },
    });

    if (slugExists) {
      throw new Error('El slug ya está en uso. Por favor elige otro.');
    }

    const organization = await prisma.organization.create({
      data: input,
    });

    return organization;
  });
