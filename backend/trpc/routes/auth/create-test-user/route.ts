import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { hashPassword, generateToken } from '@/backend/lib/auth';

export default publicProcedure
  .input(
    z.object({
      role: z.enum(['super_admin', 'seller_admin', 'collaborator', 'viewer']),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const timestamp = Date.now();
    const email = `test-${input.role}-${timestamp}@example.com`;
    const password = 'password123';

    const hashedPassword = await hashPassword(password);

    const user = await ctx.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: `Test ${input.role.replace('_', ' ')} User`,
        role: input.role,
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
      credentials: {
        email,
        password,
      },
    };
  });
