import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const updateProfileRoute = protectedProcedure
  .input(
    z.object({
      fullName: z.string().min(1).optional(),
      phone: z.string().nullable().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    console.log('Updating profile for user:', userId);
    console.log('Input data:', input);

    const updateData: { fullName?: string; phone?: string | null } = {};
    
    if (input.fullName !== undefined) {
      updateData.fullName = input.fullName;
    }
    
    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    }

    console.log('Update data to save:', updateData);

    const updatedUser = await ctx.prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return {
      ...updatedUser,
      phone: updatedUser.phone || '',
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  });

export default updateProfileRoute;
