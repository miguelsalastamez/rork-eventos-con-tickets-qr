import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const updateProfileRoute = protectedProcedure
  .input(
    z.object({
      fullName: z.string().min(1).optional(),
      phone: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const updatedUser = await ctx.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: input.fullName,
        phone: input.phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  });

export default updateProfileRoute;
