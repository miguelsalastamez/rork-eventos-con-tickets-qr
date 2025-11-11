import { protectedProcedure } from "../../../create-context";
import { prisma } from "@/backend/lib/prisma";

export const seedTestDataProcedure = protectedProcedure.mutation(
  async ({ ctx }) => {
    console.log("Seeding test data...");

    const userId = ctx.user.id;
    const organizationId = ctx.user.organizationId;

    const event1 = await prisma.event.create({
      data: {
        name: "Conferencia de Tecnología 2025",
        description: "La conferencia más importante de tecnología del año. Expositores internacionales, talleres prácticos y networking con los mejores del sector.",
        date: new Date("2025-06-15T09:00:00Z"),
        time: "09:00 AM",
        venueName: "Centro de Convenciones CDMX",
        location: "Av. Paseo de la Reforma 476, Cuauhtémoc, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        organizerLogoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
        venuePlanUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
        employeeNumberLabel: "Número de Empleado",
        successSoundId: "success-1",
        errorSoundId: "error-1",
        vibrationEnabled: true,
        vibrationIntensity: "heavy",
        primaryColor: "#2563eb",
        secondaryColor: "#3b82f6",
        accentColor: "#60a5fa",
        createdBy: userId,
        organizationId: organizationId,
      },
    });

    const event2 = await prisma.event.create({
      data: {
        name: "Festival de Música Verano 2025",
        description: "El festival más esperado del año con artistas nacionales e internacionales. Tres días de música, arte y cultura.",
        date: new Date("2025-07-20T16:00:00Z"),
        time: "04:00 PM",
        venueName: "Foro Sol",
        location: "Viaducto Río de la Piedad s/n, Granjas México, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
        organizerLogoUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200",
        venuePlanUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        employeeNumberLabel: "ID de Acceso",
        successSoundId: "success-2",
        errorSoundId: "error-1",
        vibrationEnabled: true,
        vibrationIntensity: "medium",
        primaryColor: "#dc2626",
        secondaryColor: "#ef4444",
        accentColor: "#f87171",
        createdBy: userId,
        organizationId: organizationId,
      },
    });

    const event3 = await prisma.event.create({
      data: {
        name: "Gala Anual de Negocios",
        description: "Evento exclusivo de networking empresarial. Cena de gala, premios a la excelencia empresarial y presentación de nuevos proyectos.",
        date: new Date("2025-08-10T19:00:00Z"),
        time: "07:00 PM",
        venueName: "Hotel Four Seasons",
        location: "Paseo de la Reforma 500, Juárez, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        organizerLogoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
        venuePlanUrl: "https://images.unsplash.com/photo-1519167758481-83f29da8a803?w=800",
        employeeNumberLabel: "Código de Invitación",
        successSoundId: "success-1",
        errorSoundId: "error-2",
        vibrationEnabled: false,
        vibrationIntensity: "light",
        primaryColor: "#7c3aed",
        secondaryColor: "#8b5cf6",
        accentColor: "#a78bfa",
        createdBy: userId,
        organizationId: organizationId,
      },
    });

    const pool1 = await prisma.capacityPool.create({
      data: {
        eventId: event1.id,
        name: "Pool General Conferencia",
        totalCapacity: 500,
        usedCapacity: 0,
      },
    });

    const pool2 = await prisma.capacityPool.create({
      data: {
        eventId: event2.id,
        name: "Pool General Festival",
        totalCapacity: 1000,
        usedCapacity: 0,
      },
    });

    await prisma.ticket.createMany({
      data: [
        {
          eventId: event1.id,
          name: "Entrada General",
          description: "Acceso completo a todas las conferencias y talleres",
          imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
          price: 1500,
          currency: "MXN",
          capacityType: "shared",
          sharedCapacityPoolId: pool1.id,
          saleStartDate: new Date("2025-01-01"),
          saleEndDate: new Date("2025-06-14"),
          isActive: true,
          formFields: JSON.stringify([
            { label: "Nombre Completo", type: "text", required: true },
            { label: "Empresa", type: "text", required: false },
          ]),
        },
        {
          eventId: event1.id,
          name: "VIP Pass",
          description: "Acceso VIP con meet & greet exclusivo",
          imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
          price: 3500,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 50,
          saleStartDate: new Date("2025-01-01"),
          saleEndDate: new Date("2025-06-14"),
          isActive: true,
          formFields: JSON.stringify([
            { label: "Nombre Completo", type: "text", required: true },
          ]),
        },
        {
          eventId: event2.id,
          name: "Entrada General Festival",
          description: "Acceso a las tres noches del festival",
          imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400",
          price: 2000,
          currency: "MXN",
          capacityType: "shared",
          sharedCapacityPoolId: pool2.id,
          saleStartDate: new Date("2025-02-01"),
          saleEndDate: new Date("2025-07-19"),
          isActive: true,
        },
        {
          eventId: event2.id,
          name: "Pase Backstage",
          description: "Acceso backstage y meet & greet con artistas",
          imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400",
          price: 5000,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 100,
          saleStartDate: new Date("2025-02-01"),
          saleEndDate: new Date("2025-07-19"),
          isActive: true,
        },
        {
          eventId: event3.id,
          name: "Mesa Individual",
          description: "Reserva de mesa individual para la gala",
          imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400",
          price: 5000,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 50,
          saleStartDate: new Date("2025-03-01"),
          saleEndDate: new Date("2025-08-09"),
          isActive: true,
        },
        {
          eventId: event3.id,
          name: "Mesa Empresarial (10 personas)",
          description: "Mesa empresarial con capacidad para 10 personas",
          imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400",
          price: 45000,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 10,
          saleStartDate: new Date("2025-03-01"),
          saleEndDate: new Date("2025-08-09"),
          isActive: true,
        },
      ],
    });

    await prisma.attendee.createMany({
      data: [
        {
          eventId: event1.id,
          fullName: "Juan Pérez García",
          email: "juan.perez@empresa.com",
          employeeNumber: "EMP001",
          ticketCode: "TECH2025-001",
        },
        {
          eventId: event1.id,
          fullName: "María González López",
          email: "maria.gonzalez@empresa.com",
          employeeNumber: "EMP002",
          ticketCode: "TECH2025-002",
          checkedIn: true,
          checkedInAt: new Date(),
        },
        {
          eventId: event1.id,
          fullName: "Carlos Rodríguez Martínez",
          email: "carlos.rodriguez@empresa.com",
          employeeNumber: "EMP003",
          ticketCode: "TECH2025-003",
        },
        {
          eventId: event2.id,
          fullName: "Ana María Fernández",
          email: "ana.fernandez@email.com",
          employeeNumber: "FAN001",
          ticketCode: "FEST2025-001",
        },
        {
          eventId: event2.id,
          fullName: "Roberto Silva Torres",
          email: "roberto.silva@email.com",
          employeeNumber: "FAN002",
          ticketCode: "FEST2025-002",
          checkedIn: true,
          checkedInAt: new Date(),
        },
        {
          eventId: event3.id,
          fullName: "Patricia Ramírez Sánchez",
          email: "patricia.ramirez@corporativo.com",
          employeeNumber: "CORP001",
          ticketCode: "GALA2025-001",
        },
      ],
    });

    await prisma.prize.createMany({
      data: [
        {
          eventId: event1.id,
          name: "MacBook Pro 16 pulgadas",
          description: "La última generación de MacBook Pro con chip M3 Max",
          imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
          quantity: 1,
        },
        {
          eventId: event1.id,
          name: "iPad Air",
          description: "iPad Air de última generación con Apple Pencil incluido",
          imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
          quantity: 2,
        },
        {
          eventId: event1.id,
          name: "Curso Online de Programación",
          description: "Acceso completo a plataforma de cursos por 1 año",
          imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
          quantity: 5,
        },
        {
          eventId: event2.id,
          name: "Meet & Greet con Artista Principal",
          description: "Encuentro exclusivo con el artista principal del festival",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
          quantity: 1,
        },
        {
          eventId: event2.id,
          name: "Pase VIP para próximo festival",
          description: "Acceso VIP completo para el festival del próximo año",
          imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400",
          quantity: 3,
        },
        {
          eventId: event3.id,
          name: "Viaje para 2 personas a Cancún",
          description: "Viaje todo incluido a Cancún por 5 días y 4 noches",
          imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400",
          quantity: 1,
        },
      ],
    });

    console.log("Test data seeded successfully");
    console.log(`Created 3 events with tickets, attendees, and prizes`);

    return {
      success: true,
      events: [event1, event2, event3],
    };
  }
);
