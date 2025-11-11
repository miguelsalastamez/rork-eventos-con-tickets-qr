import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { comparePasswords, generateToken } from '@/backend/lib/auth';

export default publicProcedure
  .input(
    z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(1, 'La contraseña es requerida'),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await comparePasswords(input.password, user.password);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

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
        phone: user.phone || '',
        role: user.role,
        organizationId: user.organizationId || undefined,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  });
