import { Prisma } from "@prisma/client";
import { prisma } from "./client.js";
/** Returns true if this notification was recorded now, false if it already existed. */
export async function markNotified(debateId: number, kind: string, castHash: string): Promise<boolean> {
    try {
      await prisma.notification.create({ data: { debateId, kind, castHash } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return false;
      }
      throw error;
    }
  }