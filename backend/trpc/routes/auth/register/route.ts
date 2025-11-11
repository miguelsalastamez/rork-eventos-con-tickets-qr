import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { hashPassword, generateToken } from '@/backend/lib/auth';

export default publicProcedure
  .input(
    z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      fullName: z.string().min(1, 'El nombre es requerido'),
      role: z.enum(['super_admin', 'seller_admin', 'collaborator', 'viewer']).optional(),
      organizationId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await ctx.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        role: input.role || 'viewer',
        organizationId: input.organizationId,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || undefined,
        role: user.role,
        organizationId: user.organizationId || undefined,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  });
