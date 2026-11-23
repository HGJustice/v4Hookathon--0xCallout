import { prisma } from "../db/client.js";

const KEY = "factory_next_block";

export async function getCheckpoint(): Promise<bigint | null> {
  const row = await prisma.chainState.findUnique({ where: { key: KEY } });
  return row ? BigInt(row.value) : null;
}

export async function setCheckpoint(nextBlock: bigint): Promise<void> {
  const value = nextBlock.toString();
  await prisma.chainState.upsert({
    where: { key: KEY },
    update: { value },
    create: { key: KEY, value },
  });
}