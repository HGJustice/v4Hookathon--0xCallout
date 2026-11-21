import { Prisma } from "@prisma/client";
import { prisma } from "../db/client.js";

export async function recordCast(hash: string, authorFid: number): Promise<boolean> {
  try {
    await prisma.cast.create({ data: { castHash: hash, authorFid } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false;
    }
    throw error;
  }
}