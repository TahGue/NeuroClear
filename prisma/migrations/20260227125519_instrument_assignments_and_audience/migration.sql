-- CreateEnum
CREATE TYPE "InstrumentAudience" AS ENUM ('PATIENT', 'PARENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "InstrumentAssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "instruments" ADD COLUMN     "audience" "InstrumentAudience" NOT NULL DEFAULT 'PATIENT',
ADD COLUMN     "maxAgeYears" INTEGER,
ADD COLUMN     "minAgeYears" INTEGER;

-- CreateTable
CREATE TABLE "instrument_assignments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "assignedByUserId" TEXT,
    "status" "InstrumentAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instrument_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instrument_assignments_patientId_instrumentId_key" ON "instrument_assignments"("patientId", "instrumentId");

-- AddForeignKey
ALTER TABLE "instrument_assignments" ADD CONSTRAINT "instrument_assignments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_assignments" ADD CONSTRAINT "instrument_assignments_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_assignments" ADD CONSTRAINT "instrument_assignments_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
