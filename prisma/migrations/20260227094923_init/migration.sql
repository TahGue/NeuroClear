-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCHARGED');

-- CreateEnum
CREATE TYPE "AssessmentDomain" AS ENUM ('COGNITIVE', 'ADAPTIVE', 'BEHAVIORAL', 'EXECUTIVE_FUNCTION', 'ACADEMIC', 'EMOTIONAL', 'SOCIAL');

-- CreateEnum
CREATE TYPE "AssessmentPlatform" AS ENUM ('Q_INTERACTIVE', 'Q_GLOBAL', 'MHS_ONLINE', 'ALTO');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'PENDING_REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('NONE', 'MILD', 'MODERATE', 'SEVERE');

-- CreateEnum
CREATE TYPE "NarrativeSectionType" AS ENUM ('REFERRAL', 'BACKGROUND', 'OBSERVATIONS', 'FINDINGS', 'SUMMARY');

-- CreateEnum
CREATE TYPE "RecommendationCategory" AS ENUM ('ACADEMIC_ACCOMMODATIONS', 'THERAPY', 'EDUCATIONAL_PLANNING', 'RE_EVALUATION', 'PARENTAL_SUPPORT', 'MEDICAL_REFERRAL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "referralSource" TEXT,
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" "AssessmentDomain" NOT NULL,
    "platform" "AssessmentPlatform" NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "administeredDate" TIMESTAMP(3),
    "administeredBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_assessments" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,

    CONSTRAINT "evaluation_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtests" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "index" TEXT,
    "rawScore" INTEGER,
    "scaledScore" INTEGER,

    CONSTRAINT "subtests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "subtestId" TEXT NOT NULL,
    "rawScore" INTEGER,
    "scaledScore" INTEGER,
    "percentile" DOUBLE PRECISION,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_impressions" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "dsm5Code" TEXT,
    "icd11Code" TEXT,
    "severity" "Severity" NOT NULL,
    "evidence" TEXT,

    CONSTRAINT "diagnostic_impressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "narrative_sections" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "section" "NarrativeSectionType" NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "narrative_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "category" "RecommendationCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reports_evaluationId_key" ON "reports"("evaluationId");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assessments" ADD CONSTRAINT "evaluation_assessments_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assessments" ADD CONSTRAINT "evaluation_assessments_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtests" ADD CONSTRAINT "subtests_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_subtestId_fkey" FOREIGN KEY ("subtestId") REFERENCES "subtests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_impressions" ADD CONSTRAINT "diagnostic_impressions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narrative_sections" ADD CONSTRAINT "narrative_sections_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
