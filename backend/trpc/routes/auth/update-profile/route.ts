import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { TRPCError } from '@trpc/server';

export const updateProfileRoute = protectedProcedure
  .input(
    z.object({
      fullName: z.string().min(1, 'El nombre completo es requerido').optional(),
      phone: z.string().nullable().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.user.id;

      console.log('=== UPDATE PROFILE START ===');
      console.log('User ID:', userId);
      console.log('Input:', input);

      const updateData: { fullName?: string; phone?: string | null } = {};
      
      if (input.fullName !== undefined) {
        updateData.fullName = input.fullName;
      }
      
      if (input.phone !== undefined) {
        updateData.phone = input.phone;
      }

      console.log('Update data:', updateData);

      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      console.log('User updated successfully');

      const result = {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone || null,
        role: updatedUser.role,
        organizationId: updatedUser.organizationId || null,
      };

      console.log('Returning:', result);
      console.log('=== UPDATE PROFILE END ===');

      return result;
    } catch (error) {
      console.error('=== UPDATE PROFILE ERROR ===');
      console.error('Error:', error);
      
      if (error instanceof Error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Error al actualizar el perfil: ${error.message}`,
          cause: error,
        });
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido al actualizar el perfil',
      });
    }
  });

export default updateProfileRoute;
