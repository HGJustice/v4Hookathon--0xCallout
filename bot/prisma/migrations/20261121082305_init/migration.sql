-- CreateTable
CREATE TABLE "Cast" (
    "castHash" TEXT NOT NULL,
    "authorFid" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cast_pkey" PRIMARY KEY ("castHash")
);

-- CreateTable
CREATE TABLE "Debate" (
    "id" SERIAL NOT NULL,
    "castHash" TEXT NOT NULL,
    "chainEscrowId" BIGINT,
    "challengerFid" INTEGER NOT NULL,
    "opponentFid" INTEGER NOT NULL,
    "challengerAddr" TEXT,
    "opponentAddr" TEXT,
    "claim" TEXT NOT NULL,
    "marketDeadline" BIGINT NOT NULL,
    "joinDeadline" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "marketId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "debateId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "castHash" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("debateId","kind")
);

-- CreateTable
CREATE TABLE "ChainState" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ChainState_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Debate_castHash_key" ON "Debate"("castHash");

-- CreateIndex
CREATE UNIQUE INDEX "Debate_chainEscrowId_key" ON "Debate"("chainEscrowId");

-- AddForeignKey
ALTER TABLE "Debate" ADD CONSTRAINT "Debate_castHash_fkey" FOREIGN KEY ("castHash") REFERENCES "Cast"("castHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_debateId_fkey" FOREIGN KEY ("debateId") REFERENCES "Debate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
