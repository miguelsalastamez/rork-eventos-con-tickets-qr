import { protectedProcedure } from "../../../create-context";
import { prisma } from "@/backend/lib/prisma";

export const deleteAllTestDataProcedure = protectedProcedure.mutation(
  async ({ ctx }) => {
    console.log("Deleting all test data...");

    await prisma.$transaction([
      prisma.raffleWinner.deleteMany(),
      prisma.prize.deleteMany(),
      prisma.message.deleteMany(),
      prisma.purchase.deleteMany(),
      prisma.attendee.deleteMany(),
      prisma.ticket.deleteMany(),
      prisma.capacityPool.deleteMany(),
      prisma.event.deleteMany(),
    ]);

    console.log("All test data deleted successfully");
    
    return { success: true };
  }
);
