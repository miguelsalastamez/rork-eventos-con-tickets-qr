import { protectedProcedure } from "@/backend/trpc/create-context";

export const listEventsRoute = protectedProcedure.query(async ({ ctx }) => {
  const { user, prisma } = ctx;

  let events;
  
  if (user.role === 'super_admin') {
    events = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } else if (user.organizationId) {
    events = await prisma.event.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } else {
    events = await prisma.event.findMany({
      where: {
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  return events.map((event: any) => ({
    ...event,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }));
});

export default listEventsRoute;
