import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  const dbUser = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      organizationId: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    return ctx.user;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.fullName,
    phone: dbUser.phone || undefined,
    role: dbUser.role,
    organizationId: dbUser.organizationId || undefined,
    createdAt: dbUser.createdAt.toISOString(),
  };
});
