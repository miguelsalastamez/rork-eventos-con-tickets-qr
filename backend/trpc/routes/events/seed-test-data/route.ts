import { protectedProcedure } from "../../../create-context";
import { prisma } from "@/backend/lib/prisma";

export const seedTestDataProcedure = protectedProcedure.mutation(
  async ({ ctx }) => {
    console.log("🌱 Seeding comprehensive test data...");

    const userId = ctx.user.id;

    const org1 = await prisma.organization.create({
      data: {
        name: "TechEvents Global",
        slug: "techevents-global",
        description: "Líder mundial en conferencias de tecnología y eventos de innovación digital",
        logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
        coverUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
        website: "https://techevents.global",
        contactEmail: "info@techevents.global",
        contactPhone: "+52 55 1234 5678",
      },
    });

    const org2 = await prisma.organization.create({
      data: {
        name: "Live Music Productions",
        slug: "live-music-pro",
        description: "Organizadores de los mejores festivales y conciertos de México",
        logoUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200",
        coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200",
        website: "https://livemusicpro.mx",
        contactEmail: "contacto@livemusicpro.mx",
        contactPhone: "+52 55 8765 4321",
      },
    });

    const org3 = await prisma.organization.create({
      data: {
        name: "Elite Business Events",
        slug: "elite-business",
        description: "Eventos corporativos de alto nivel y networking empresarial exclusivo",
        logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
        coverUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200",
        website: "https://elitebusiness.mx",
        contactEmail: "eventos@elitebusiness.mx",
        contactPhone: "+52 55 9988 7766",
      },
    });

    const org4 = await prisma.organization.create({
      data: {
        name: "Deportes Extremos MX",
        slug: "deportes-extremos",
        description: "Organizadores de competencias y eventos de deportes extremos",
        logoUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200",
        coverUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200",
        website: "https://deportesextremosmx.com",
        contactEmail: "info@deportesextremosmx.com",
        contactPhone: "+52 55 5544 3322",
      },
    });

    const event1 = await prisma.event.create({
      data: {
        name: "Conferencia de Tecnología 2025",
        description: "La conferencia más importante de tecnología del año. Expositores internacionales, talleres prácticos y networking con los mejores del sector.",
        date: new Date("2025-06-15T09:00:00Z"),
        time: "09:00 AM",
        venueName: "Centro de Convenciones CDMX",
        location: "Av. Paseo de la Reforma 476, Cuauhtémoc, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        organizerLogoUrl: org1.logoUrl,
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
        organizationId: org1.id,
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
        organizerLogoUrl: org2.logoUrl,
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
        organizationId: org2.id,
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
        organizerLogoUrl: org3.logoUrl,
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
        organizationId: org3.id,
      },
    });

    const event4 = await prisma.event.create({
      data: {
        name: "Hackathon Innovation 2025",
        description: "48 horas de código intensivo. Desarrolladores de todo el país compitiendo por premios de más de $500,000 MXN.",
        date: new Date("2025-09-05T18:00:00Z"),
        time: "06:00 PM",
        venueName: "Campus Tecnológico",
        location: "Av. Universidad 3000, Copilco Universidad, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
        organizerLogoUrl: org1.logoUrl,
        venuePlanUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        employeeNumberLabel: "Código de Equipo",
        successSoundId: "success-1",
        errorSoundId: "error-1",
        vibrationEnabled: true,
        vibrationIntensity: "heavy",
        primaryColor: "#059669",
        secondaryColor: "#10b981",
        accentColor: "#34d399",
        createdBy: userId,
        organizationId: org1.id,
      },
    });

    const event5 = await prisma.event.create({
      data: {
        name: "Rock en Español Festival",
        description: "Las mejores bandas de rock en español en un solo lugar. Una noche épica de rock y energía.",
        date: new Date("2025-10-12T19:00:00Z"),
        time: "07:00 PM",
        venueName: "Palacio de los Deportes",
        location: "Añil 635, Granjas México, Iztacalco, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800",
        organizerLogoUrl: org2.logoUrl,
        venuePlanUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800",
        employeeNumberLabel: "Pulsera ID",
        successSoundId: "success-2",
        errorSoundId: "error-1",
        vibrationEnabled: true,
        vibrationIntensity: "heavy",
        primaryColor: "#ea580c",
        secondaryColor: "#f97316",
        accentColor: "#fb923c",
        createdBy: userId,
        organizationId: org2.id,
      },
    });

    const event6 = await prisma.event.create({
      data: {
        name: "Cumbre de Liderazgo Empresarial",
        description: "Los CEOs más influyentes de México comparten sus estrategias de éxito. Networking exclusivo y casos de estudio.",
        date: new Date("2025-11-20T08:00:00Z"),
        time: "08:00 AM",
        venueName: "World Trade Center México",
        location: "Montecito 38, Nápoles, Benito Juárez, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        organizerLogoUrl: org3.logoUrl,
        venuePlanUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
        employeeNumberLabel: "Badge ID",
        successSoundId: "success-1",
        errorSoundId: "error-2",
        vibrationEnabled: false,
        vibrationIntensity: "light",
        primaryColor: "#0891b2",
        secondaryColor: "#06b6d4",
        accentColor: "#22d3ee",
        createdBy: userId,
        organizationId: org3.id,
      },
    });

    const event7 = await prisma.event.create({
      data: {
        name: "Campeonato Nacional de BMX",
        description: "Los mejores riders de BMX de México compiten por el título nacional. Acrobacias, velocidad y adrenalina pura.",
        date: new Date("2025-07-28T10:00:00Z"),
        time: "10:00 AM",
        venueName: "Parque Extremo Del Valle",
        location: "Av. División del Norte 3000, Del Valle, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800",
        organizerLogoUrl: org4.logoUrl,
        venuePlanUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
        employeeNumberLabel: "Número de Competidor",
        successSoundId: "success-1",
        errorSoundId: "error-1",
        vibrationEnabled: true,
        vibrationIntensity: "heavy",
        primaryColor: "#eab308",
        secondaryColor: "#facc15",
        accentColor: "#fde047",
        createdBy: userId,
        organizationId: org4.id,
      },
    });

    const event8 = await prisma.event.create({
      data: {
        name: "Festival Electrónico Sunrise",
        description: "Los mejores DJs internacionales en una experiencia musical única. Arte visual, luces y la mejor música electrónica.",
        date: new Date("2025-12-31T22:00:00Z"),
        time: "10:00 PM",
        venueName: "Autódromo Hermanos Rodríguez",
        location: "Granjas México, Iztacalco, CDMX",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
        organizerLogoUrl: org2.logoUrl,
        venuePlanUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800",
        employeeNumberLabel: "Wristband ID",
        successSoundId: "success-2",
        errorSoundId: "error-1",
        vibrationEnabled: true,
        vibrationIntensity: "medium",
        primaryColor: "#8b5cf6",
        secondaryColor: "#a78bfa",
        accentColor: "#c4b5fd",
        createdBy: userId,
        organizationId: org2.id,
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

    const pool4 = await prisma.capacityPool.create({
      data: {
        eventId: event4.id,
        name: "Pool Hackathon",
        totalCapacity: 300,
        usedCapacity: 0,
      },
    });

    const pool5 = await prisma.capacityPool.create({
      data: {
        eventId: event5.id,
        name: "Pool Rock Festival",
        totalCapacity: 2000,
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
        {
          eventId: event4.id,
          name: "Registro Individual",
          description: "Registro individual para participar en el hackathon",
          imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400",
          price: 500,
          currency: "MXN",
          capacityType: "shared",
          sharedCapacityPoolId: pool4.id,
          saleStartDate: new Date("2025-01-01"),
          saleEndDate: new Date("2025-09-04"),
          isActive: true,
        },
        {
          eventId: event4.id,
          name: "Equipo Completo (4 personas)",
          description: "Registro de equipo completo con workspace dedicado",
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
          price: 1800,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 75,
          saleStartDate: new Date("2025-01-01"),
          saleEndDate: new Date("2025-09-04"),
          isActive: true,
        },
        {
          eventId: event5.id,
          name: "General Admission",
          description: "Entrada general al festival",
          imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400",
          price: 1200,
          currency: "MXN",
          capacityType: "shared",
          sharedCapacityPoolId: pool5.id,
          saleStartDate: new Date("2025-03-01"),
          saleEndDate: new Date("2025-10-11"),
          isActive: true,
        },
        {
          eventId: event5.id,
          name: "VIP Golden Circle",
          description: "Zona preferente cerca del escenario",
          imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400",
          price: 3500,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 200,
          saleStartDate: new Date("2025-03-01"),
          saleEndDate: new Date("2025-10-11"),
          isActive: true,
        },
        {
          eventId: event6.id,
          name: "Entrada Individual",
          description: "Acceso individual a la cumbre",
          imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400",
          price: 8000,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 100,
          saleStartDate: new Date("2025-04-01"),
          saleEndDate: new Date("2025-11-19"),
          isActive: true,
        },
        {
          eventId: event7.id,
          name: "Entrada Espectador",
          description: "Acceso para ver las competencias",
          imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400",
          price: 300,
          currency: "MXN",
          capacityType: "unlimited",
          saleStartDate: new Date("2025-02-01"),
          saleEndDate: new Date("2025-07-27"),
          isActive: true,
        },
        {
          eventId: event7.id,
          name: "Registro Competidor",
          description: "Registro oficial para competidores",
          imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
          price: 1500,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 50,
          saleStartDate: new Date("2025-02-01"),
          saleEndDate: new Date("2025-07-20"),
          isActive: true,
        },
        {
          eventId: event8.id,
          name: "Early Bird",
          description: "Precio especial de preventa",
          imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
          price: 1800,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 500,
          saleStartDate: new Date("2025-05-01"),
          saleEndDate: new Date("2025-09-01"),
          isActive: true,
        },
        {
          eventId: event8.id,
          name: "VIP Experience",
          description: "Acceso VIP con área exclusiva y bebidas premium",
          imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
          price: 5500,
          currency: "MXN",
          capacityType: "dedicated",
          dedicatedCapacity: 150,
          saleStartDate: new Date("2025-05-01"),
          saleEndDate: new Date("2025-12-30"),
          isActive: true,
        },
      ],
    });

    const attendeesData = [
      { eventId: event1.id, fullName: "Juan Pérez García", email: "juan.perez@empresa.com", employeeNumber: "EMP001", ticketCode: "TECH2025-001" },
      { eventId: event1.id, fullName: "María González López", email: "maria.gonzalez@empresa.com", employeeNumber: "EMP002", ticketCode: "TECH2025-002", checkedIn: true, checkedInAt: new Date() },
      { eventId: event1.id, fullName: "Carlos Rodríguez Martínez", email: "carlos.rodriguez@empresa.com", employeeNumber: "EMP003", ticketCode: "TECH2025-003" },
      { eventId: event1.id, fullName: "Laura Martínez Soto", email: "laura.martinez@empresa.com", employeeNumber: "EMP004", ticketCode: "TECH2025-004", checkedIn: true, checkedInAt: new Date() },
      { eventId: event1.id, fullName: "Pedro Hernández Cruz", email: "pedro.hernandez@empresa.com", employeeNumber: "EMP005", ticketCode: "TECH2025-005" },
      { eventId: event1.id, fullName: "Ana Sofía López", email: "ana.lopez@empresa.com", employeeNumber: "EMP006", ticketCode: "TECH2025-006", checkedIn: true, checkedInAt: new Date() },
      { eventId: event1.id, fullName: "Miguel Ángel Ramírez", email: "miguel.ramirez@empresa.com", employeeNumber: "EMP007", ticketCode: "TECH2025-007" },
      { eventId: event1.id, fullName: "Carmen Patricia Flores", email: "carmen.flores@empresa.com", employeeNumber: "EMP008", ticketCode: "TECH2025-008", checkedIn: true, checkedInAt: new Date() },
      { eventId: event1.id, fullName: "José Luis García", email: "jose.garcia@empresa.com", employeeNumber: "EMP009", ticketCode: "TECH2025-009" },
      { eventId: event1.id, fullName: "Diana Alejandra Ruiz", email: "diana.ruiz@empresa.com", employeeNumber: "EMP010", ticketCode: "TECH2025-010", checkedIn: true, checkedInAt: new Date() },
      { eventId: event1.id, fullName: "Roberto Carlos Vega", email: "roberto.vega@empresa.com", employeeNumber: "EMP011", ticketCode: "TECH2025-011" },
      { eventId: event1.id, fullName: "Gabriela Méndez Ramos", email: "gabriela.mendez@empresa.com", employeeNumber: "EMP012", ticketCode: "TECH2025-012", checkedIn: true, checkedInAt: new Date() },
      { eventId: event1.id, fullName: "Fernando Sánchez Díaz", email: "fernando.sanchez@empresa.com", employeeNumber: "EMP013", ticketCode: "TECH2025-013" },
      { eventId: event1.id, fullName: "Valeria Torres Morales", email: "valeria.torres@empresa.com", employeeNumber: "EMP014", ticketCode: "TECH2025-014" },
      { eventId: event1.id, fullName: "Alejandro Castro Luna", email: "alejandro.castro@empresa.com", employeeNumber: "EMP015", ticketCode: "TECH2025-015", checkedIn: true, checkedInAt: new Date() },

      { eventId: event2.id, fullName: "Ana María Fernández", email: "ana.fernandez@email.com", employeeNumber: "FAN001", ticketCode: "FEST2025-001" },
      { eventId: event2.id, fullName: "Roberto Silva Torres", email: "roberto.silva@email.com", employeeNumber: "FAN002", ticketCode: "FEST2025-002", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Mónica López Gutiérrez", email: "monica.lopez@email.com", employeeNumber: "FAN003", ticketCode: "FEST2025-003", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Daniel Ortiz Mendoza", email: "daniel.ortiz@email.com", employeeNumber: "FAN004", ticketCode: "FEST2025-004" },
      { eventId: event2.id, fullName: "Sandra Jiménez Rojas", email: "sandra.jimenez@email.com", employeeNumber: "FAN005", ticketCode: "FEST2025-005", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Ricardo Moreno Pérez", email: "ricardo.moreno@email.com", employeeNumber: "FAN006", ticketCode: "FEST2025-006" },
      { eventId: event2.id, fullName: "Claudia Vargas Soto", email: "claudia.vargas@email.com", employeeNumber: "FAN007", ticketCode: "FEST2025-007", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Jorge Alberto Reyes", email: "jorge.reyes@email.com", employeeNumber: "FAN008", ticketCode: "FEST2025-008" },
      { eventId: event2.id, fullName: "Mariana Castro Villa", email: "mariana.castro@email.com", employeeNumber: "FAN009", ticketCode: "FEST2025-009", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Arturo Navarro Cruz", email: "arturo.navarro@email.com", employeeNumber: "FAN010", ticketCode: "FEST2025-010" },
      { eventId: event2.id, fullName: "Paola Ramírez Fernández", email: "paola.ramirez@email.com", employeeNumber: "FAN011", ticketCode: "FEST2025-011", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Eduardo Martínez Luna", email: "eduardo.martinez@email.com", employeeNumber: "FAN012", ticketCode: "FEST2025-012" },
      { eventId: event2.id, fullName: "Lucía González Ruiz", email: "lucia.gonzalez@email.com", employeeNumber: "FAN013", ticketCode: "FEST2025-013", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Andrés Herrera Díaz", email: "andres.herrera@email.com", employeeNumber: "FAN014", ticketCode: "FEST2025-014" },
      { eventId: event2.id, fullName: "Isabel Flores Santos", email: "isabel.flores@email.com", employeeNumber: "FAN015", ticketCode: "FEST2025-015", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Rafael Torres Gómez", email: "rafael.torres@email.com", employeeNumber: "FAN016", ticketCode: "FEST2025-016" },
      { eventId: event2.id, fullName: "Carolina Méndez Rivas", email: "carolina.mendez@email.com", employeeNumber: "FAN017", ticketCode: "FEST2025-017", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Manuel Sánchez Vega", email: "manuel.sanchez@email.com", employeeNumber: "FAN018", ticketCode: "FEST2025-018" },
      { eventId: event2.id, fullName: "Fernanda López Castro", email: "fernanda.lopez@email.com", employeeNumber: "FAN019", ticketCode: "FEST2025-019", checkedIn: true, checkedInAt: new Date() },
      { eventId: event2.id, fullName: "Rodrigo García Morales", email: "rodrigo.garcia@email.com", employeeNumber: "FAN020", ticketCode: "FEST2025-020" },

      { eventId: event3.id, fullName: "Patricia Ramírez Sánchez", email: "patricia.ramirez@corporativo.com", employeeNumber: "CORP001", ticketCode: "GALA2025-001" },
      { eventId: event3.id, fullName: "Carlos Alberto Mendoza", email: "carlos.mendoza@corporativo.com", employeeNumber: "CORP002", ticketCode: "GALA2025-002", checkedIn: true, checkedInAt: new Date() },
      { eventId: event3.id, fullName: "Verónica Silva Ortiz", email: "veronica.silva@corporativo.com", employeeNumber: "CORP003", ticketCode: "GALA2025-003" },
      { eventId: event3.id, fullName: "Francisco Javier López", email: "francisco.lopez@corporativo.com", employeeNumber: "CORP004", ticketCode: "GALA2025-004", checkedIn: true, checkedInAt: new Date() },
      { eventId: event3.id, fullName: "Adriana González Pérez", email: "adriana.gonzalez@corporativo.com", employeeNumber: "CORP005", ticketCode: "GALA2025-005" },
      { eventId: event3.id, fullName: "Mauricio Hernández Ruiz", email: "mauricio.hernandez@corporativo.com", employeeNumber: "CORP006", ticketCode: "GALA2025-006", checkedIn: true, checkedInAt: new Date() },
      { eventId: event3.id, fullName: "Natalia Vargas Moreno", email: "natalia.vargas@corporativo.com", employeeNumber: "CORP007", ticketCode: "GALA2025-007" },
      { eventId: event3.id, fullName: "Héctor Ramírez Díaz", email: "hector.ramirez@corporativo.com", employeeNumber: "CORP008", ticketCode: "GALA2025-008" },

      { eventId: event4.id, fullName: "Diego Torres", email: "diego@dev.com", employeeNumber: "HACK001", ticketCode: "HACK2025-001" },
      { eventId: event4.id, fullName: "Sofía Méndez", email: "sofia@dev.com", employeeNumber: "HACK002", ticketCode: "HACK2025-002", checkedIn: true, checkedInAt: new Date() },
      { eventId: event4.id, fullName: "Leonardo García", email: "leonardo@dev.com", employeeNumber: "HACK003", ticketCode: "HACK2025-003", checkedIn: true, checkedInAt: new Date() },
      { eventId: event4.id, fullName: "Camila Rodríguez", email: "camila@dev.com", employeeNumber: "HACK004", ticketCode: "HACK2025-004" },
      { eventId: event4.id, fullName: "Sebastián Martínez", email: "sebastian@dev.com", employeeNumber: "HACK005", ticketCode: "HACK2025-005", checkedIn: true, checkedInAt: new Date() },
      { eventId: event4.id, fullName: "Valentina López", email: "valentina@dev.com", employeeNumber: "HACK006", ticketCode: "HACK2025-006" },
      { eventId: event4.id, fullName: "Mateo Fernández", email: "mateo@dev.com", employeeNumber: "HACK007", ticketCode: "HACK2025-007", checkedIn: true, checkedInAt: new Date() },
      { eventId: event4.id, fullName: "Isabella Sánchez", email: "isabella@dev.com", employeeNumber: "HACK008", ticketCode: "HACK2025-008" },
      { eventId: event4.id, fullName: "Santiago Pérez", email: "santiago@dev.com", employeeNumber: "HACK009", ticketCode: "HACK2025-009", checkedIn: true, checkedInAt: new Date() },
      { eventId: event4.id, fullName: "Luciana Torres", email: "luciana@dev.com", employeeNumber: "HACK010", ticketCode: "HACK2025-010" },
      { eventId: event4.id, fullName: "Emiliano Ruiz", email: "emiliano@dev.com", employeeNumber: "HACK011", ticketCode: "HACK2025-011", checkedIn: true, checkedInAt: new Date() },
      { eventId: event4.id, fullName: "Martina Castro", email: "martina@dev.com", employeeNumber: "HACK012", ticketCode: "HACK2025-012" },

      { eventId: event5.id, fullName: "Luis Ramírez", email: "luis@rock.com", employeeNumber: "ROCK001", ticketCode: "ROCK2025-001" },
      { eventId: event5.id, fullName: "Carmen Vega", email: "carmen@rock.com", employeeNumber: "ROCK002", ticketCode: "ROCK2025-002" },
      { eventId: event5.id, fullName: "David Morales", email: "david@rock.com", employeeNumber: "ROCK003", ticketCode: "ROCK2025-003", checkedIn: true, checkedInAt: new Date() },
      { eventId: event5.id, fullName: "Patricia Luna", email: "patricia@rock.com", employeeNumber: "ROCK004", ticketCode: "ROCK2025-004" },
      { eventId: event5.id, fullName: "Alberto Guzmán", email: "alberto@rock.com", employeeNumber: "ROCK005", ticketCode: "ROCK2025-005", checkedIn: true, checkedInAt: new Date() },
      { eventId: event5.id, fullName: "Rosa María Delgado", email: "rosa@rock.com", employeeNumber: "ROCK006", ticketCode: "ROCK2025-006" },
      { eventId: event5.id, fullName: "Javier Cortés", email: "javier@rock.com", employeeNumber: "ROCK007", ticketCode: "ROCK2025-007", checkedIn: true, checkedInAt: new Date() },
      { eventId: event5.id, fullName: "Elena Romero", email: "elena@rock.com", employeeNumber: "ROCK008", ticketCode: "ROCK2025-008" },
      { eventId: event5.id, fullName: "Óscar Herrera", email: "oscar@rock.com", employeeNumber: "ROCK009", ticketCode: "ROCK2025-009", checkedIn: true, checkedInAt: new Date() },
      { eventId: event5.id, fullName: "Beatriz Campos", email: "beatriz@rock.com", employeeNumber: "ROCK010", ticketCode: "ROCK2025-010" },

      { eventId: event6.id, fullName: "Roberto Sánchez", email: "roberto@empresa.com", employeeNumber: "CEO001", ticketCode: "LEAD2025-001", checkedIn: true, checkedInAt: new Date() },
      { eventId: event6.id, fullName: "Elena Martínez", email: "elena@empresa.com", employeeNumber: "CEO002", ticketCode: "LEAD2025-002" },
      { eventId: event6.id, fullName: "Guillermo Ramos", email: "guillermo@empresa.com", employeeNumber: "CEO003", ticketCode: "LEAD2025-003", checkedIn: true, checkedInAt: new Date() },
      { eventId: event6.id, fullName: "Silvia Reyes", email: "silvia@empresa.com", employeeNumber: "CEO004", ticketCode: "LEAD2025-004" },
      { eventId: event6.id, fullName: "Tomás Villa", email: "tomas@empresa.com", employeeNumber: "CEO005", ticketCode: "LEAD2025-005", checkedIn: true, checkedInAt: new Date() },

      { eventId: event7.id, fullName: "Alejandro Cruz", email: "alex@bmx.com", employeeNumber: "BMX001", ticketCode: "BMX2025-001" },
      { eventId: event7.id, fullName: "Kevin Morales", email: "kevin@bmx.com", employeeNumber: "BMX002", ticketCode: "BMX2025-002", checkedIn: true, checkedInAt: new Date() },
      { eventId: event7.id, fullName: "Bryan Hernández", email: "bryan@bmx.com", employeeNumber: "BMX003", ticketCode: "BMX2025-003" },
      { eventId: event7.id, fullName: "Alan Jiménez", email: "alan@bmx.com", employeeNumber: "BMX004", ticketCode: "BMX2025-004", checkedIn: true, checkedInAt: new Date() },
      { eventId: event7.id, fullName: "César López", email: "cesar@bmx.com", employeeNumber: "BMX005", ticketCode: "BMX2025-005" },
      { eventId: event7.id, fullName: "Marco Ramírez", email: "marco@bmx.com", employeeNumber: "BMX006", ticketCode: "BMX2025-006", checkedIn: true, checkedInAt: new Date() },

      { eventId: event8.id, fullName: "Valeria Morales", email: "vale@music.com", employeeNumber: "EDM001", ticketCode: "SUNRISE2025-001" },
      { eventId: event8.id, fullName: "Fernando López", email: "fer@music.com", employeeNumber: "EDM002", ticketCode: "SUNRISE2025-002", checkedIn: true, checkedInAt: new Date() },
      { eventId: event8.id, fullName: "Andrea Soto", email: "andrea@music.com", employeeNumber: "EDM003", ticketCode: "SUNRISE2025-003", checkedIn: true, checkedInAt: new Date() },
      { eventId: event8.id, fullName: "Bruno García", email: "bruno@music.com", employeeNumber: "EDM004", ticketCode: "SUNRISE2025-004" },
      { eventId: event8.id, fullName: "Daniela Ruiz", email: "daniela@music.com", employeeNumber: "EDM005", ticketCode: "SUNRISE2025-005", checkedIn: true, checkedInAt: new Date() },
      { eventId: event8.id, fullName: "Cristian Méndez", email: "cristian@music.com", employeeNumber: "EDM006", ticketCode: "SUNRISE2025-006" },
      { eventId: event8.id, fullName: "Paulina Castro", email: "paulina@music.com", employeeNumber: "EDM007", ticketCode: "SUNRISE2025-007", checkedIn: true, checkedInAt: new Date() },
      { eventId: event8.id, fullName: "Erick Torres", email: "erick@music.com", employeeNumber: "EDM008", ticketCode: "SUNRISE2025-008" },
      { eventId: event8.id, fullName: "Mariana Flores", email: "mariana@music.com", employeeNumber: "EDM009", ticketCode: "SUNRISE2025-009", checkedIn: true, checkedInAt: new Date() },
      { eventId: event8.id, fullName: "Iván Navarro", email: "ivan@music.com", employeeNumber: "EDM010", ticketCode: "SUNRISE2025-010" },
      { eventId: event8.id, fullName: "Ximena Ortiz", email: "ximena@music.com", employeeNumber: "EDM011", ticketCode: "SUNRISE2025-011", checkedIn: true, checkedInAt: new Date() },
      { eventId: event8.id, fullName: "Gabriel Vargas", email: "gabriel@music.com", employeeNumber: "EDM012", ticketCode: "SUNRISE2025-012" },
      { eventId: event8.id, fullName: "Sofía Ramírez", email: "sofia.r@music.com", employeeNumber: "EDM013", ticketCode: "SUNRISE2025-013", checkedIn: true, checkedInAt: new Date() },
      { eventId: event8.id, fullName: "Axel González", email: "axel@music.com", employeeNumber: "EDM014", ticketCode: "SUNRISE2025-014" },
      { eventId: event8.id, fullName: "Renata Silva", email: "renata@music.com", employeeNumber: "EDM015", ticketCode: "SUNRISE2025-015", checkedIn: true, checkedInAt: new Date() },
    ];

    await prisma.attendee.createMany({
      data: attendeesData,
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
        {
          eventId: event4.id,
          name: "Premio al Mejor Proyecto",
          description: "$250,000 MXN + Mentoría con inversores",
          imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400",
          quantity: 1,
        },
        {
          eventId: event4.id,
          name: "Premio Innovación Social",
          description: "$100,000 MXN + Incubación por 6 meses",
          imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400",
          quantity: 1,
        },
        {
          eventId: event5.id,
          name: "Guitarra Fender Stratocaster Firmada",
          description: "Firmada por todos los artistas del festival",
          imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
          quantity: 1,
        },
        {
          eventId: event5.id,
          name: "Pases Backstage",
          description: "Acceso backstage y meet & greet",
          imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400",
          quantity: 5,
        },
        {
          eventId: event7.id,
          name: "Bicicleta BMX Profesional",
          description: "BMX de competición profesional completa",
          imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400",
          quantity: 1,
        },
        {
          eventId: event8.id,
          name: "Pase VIP Anual",
          description: "Acceso VIP a todos los festivales del año",
          imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
          quantity: 2,
        },
      ],
    });

    console.log("✅ Comprehensive test data seeded successfully");
    console.log(`📊 Created 4 organizations`);
    console.log(`🎉 Created 8 events with tickets, ${attendeesData.length} attendees, and prizes`);
    console.log(`\n🏪 Stores created:`);
    console.log(`   - /store/techevents-global (TechEvents Global - 3 eventos)`);
    console.log(`   - /store/live-music-pro (Live Music Productions - 3 eventos)`);
    console.log(`   - /store/elite-business (Elite Business Events - 2 eventos)`);
    console.log(`   - /store/deportes-extremos (Deportes Extremos MX - 1 evento)`);
    console.log(`\n📝 Summary:`);
    console.log(`   - Event 1: ${attendeesData.filter(a => a.eventId === event1.id).length} asistentes`);
    console.log(`   - Event 2: ${attendeesData.filter(a => a.eventId === event2.id).length} asistentes`);
    console.log(`   - Event 3: ${attendeesData.filter(a => a.eventId === event3.id).length} asistentes`);
    console.log(`   - Event 4: ${attendeesData.filter(a => a.eventId === event4.id).length} asistentes`);
    console.log(`   - Event 5: ${attendeesData.filter(a => a.eventId === event5.id).length} asistentes`);
    console.log(`   - Event 6: ${attendeesData.filter(a => a.eventId === event6.id).length} asistentes`);
    console.log(`   - Event 7: ${attendeesData.filter(a => a.eventId === event7.id).length} asistentes`);
    console.log(`   - Event 8: ${attendeesData.filter(a => a.eventId === event8.id).length} asistentes`);

    return {
      success: true,
      organizations: [org1, org2, org3, org4],
      events: [event1, event2, event3, event4, event5, event6, event7, event8],
    };
  }
);
