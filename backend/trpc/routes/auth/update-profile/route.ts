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
    try {
      const userId = ctx.user.id;

      console.log('Updating profile for user:', userId);
      console.log('Input data:', JSON.stringify(input, null, 2));

      const updateData: { fullName?: string; phone?: string | null } = {};
      
      if (input.fullName !== undefined) {
        updateData.fullName = input.fullName;
      }
      
      if (input.phone !== undefined) {
        updateData.phone = input.phone;
      }

      console.log('Update data to save:', JSON.stringify(updateData, null, 2));

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

      console.log('User updated in database:', JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
      }, null, 2));

      console.log('Returning user data:', JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
      }, null, 2));

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone ?? undefined,
        role: updatedUser.role,
        organizationId: updatedUser.organizationId ?? undefined,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error(`Error al actualizar el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  });

export default updateProfileRoute;
