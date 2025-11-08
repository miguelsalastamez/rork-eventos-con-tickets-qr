import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../lib/prisma';

export const listOrganizationsRoute = protectedProcedure.query(async ({ ctx }) => {
  if (ctx.user.role === 'super_admin') {
    const organizations = await prisma.organization.findMany({
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        events: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations;
  }

  if (ctx.user.organizationId) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: ctx.user.organizationId,
      },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        events: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return organization ? [organization] : [];
  }

  return [];
});
