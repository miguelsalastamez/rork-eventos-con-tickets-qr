import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const getOrganizationBySlugRoute = publicProcedure
  .input(
    z.object({
      slug: z.string(),
    })
  )
  .query(async ({ input }) => {
    const organization = await prisma.organization.findUnique({
      where: {
        slug: input.slug,
      },
      include: {
        events: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
          include: {
            tickets: {
              where: {
                isActive: true,
                saleStartDate: {
                  lte: new Date(),
                },
                saleEndDate: {
                  gte: new Date(),
                },
              },
            },
            _count: {
              select: {
                attendees: true,
              },
            },
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!organization) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Organización no encontrada',
      });
    }

    return organization;
  });
