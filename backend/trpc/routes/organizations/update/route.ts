import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const updateOrganizationRoute = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
      coverUrl: z.string().optional(),
      website: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, slug, ...updates } = input;

    if (slug) {
      const slugExists = await prisma.organization.findFirst({
        where: {
          slug: slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        throw new Error('El slug ya está en uso. Por favor elige otro.');
      }
    }
    
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...updates,
        ...(slug && { slug }),
      },
    });

    return organization;
  });
