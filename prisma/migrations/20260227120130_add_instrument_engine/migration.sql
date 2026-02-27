-- CreateEnum
CREATE TYPE "InstrumentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InstrumentSessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED');

-- CreateTable
CREATE TABLE "instruments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "InstrumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_items" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,

    CONSTRAINT "instrument_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_sessions" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "InstrumentSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instrument_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "instrument_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "interpretation" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instrument_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instruments_slug_key" ON "instruments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_items_instrumentId_order_key" ON "instrument_items"("instrumentId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_responses_sessionId_itemId_key" ON "instrument_responses"("sessionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_results_sessionId_key" ON "instrument_results"("sessionId");

-- AddForeignKey
ALTER TABLE "instrument_items" ADD CONSTRAINT "instrument_items_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_sessions" ADD CONSTRAINT "instrument_sessions_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_sessions" ADD CONSTRAINT "instrument_sessions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_responses" ADD CONSTRAINT "instrument_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "instrument_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_responses" ADD CONSTRAINT "instrument_responses_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "instrument_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_results" ADD CONSTRAINT "instrument_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "instrument_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
