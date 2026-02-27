import {
  PrismaClient,
  AssessmentDomain,
  AssessmentPlatform,
  PatientStatus,
  EvaluationStatus,
  Severity,
  NarrativeSectionType,
  RecommendationCategory,
  Priority,
  UserRole,
} from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  await prisma.recommendation.deleteMany()
  await prisma.narrativeSection.deleteMany()
  await prisma.diagnosticImpression.deleteMany()
  await prisma.report.deleteMany()
  await prisma.score.deleteMany()
  await prisma.subtest.deleteMany()
  await prisma.evaluationAssessment.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash("password123", 10)

  await prisma.user.create({
    data: {
      email: "admin@neuroclear.app",
      name: "System Admin",
      role: UserRole.ADMIN,
      passwordHash,
    },
  })

  const patient = await prisma.patient.create({
    data: {
      firstName: "Emma",
      lastName: "Thompson",
      dateOfBirth: new Date("2012-03-15"),
      referralSource: "School Counselor",
      status: PatientStatus.ACTIVE,
    },
  })

  await prisma.user.create({
    data: {
      email: "emma.patient@neuroclear.app",
      name: "Emma Thompson",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: patient.id,
    },
  })

  const wiscV = await prisma.assessment.create({
    data: {
      name: "WISC-V",
      domain: AssessmentDomain.COGNITIVE,
      platform: AssessmentPlatform.Q_INTERACTIVE,
      minAge: 6,
      maxAge: 16,
      description: "Wechsler Intelligence Scale for Children - Fifth Edition",
      subtests: {
        create: [
          { name: "Similarities", index: "VCI" },
          { name: "Vocabulary", index: "VCI" },
          { name: "Block Design", index: "VSI" },
          { name: "Visual Puzzles", index: "VSI" },
          { name: "Digit Span", index: "WMI" },
          { name: "Coding", index: "PSI" },
          { name: "Figure Weights", index: "FRI" },
        ],
      },
    },
  })

  const evaluation = await prisma.evaluation.create({
    data: {
      patientId: patient.id,
      assessmentId: wiscV.id,
      status: EvaluationStatus.COMPLETED,
      administeredDate: new Date("2024-01-15"),
      administeredBy: "Dr. Smith",
      notes: "Cooperative during testing.",
    },
  })

  const subtests = await prisma.subtest.findMany({
    where: { assessmentId: wiscV.id },
  })

  for (const s of subtests) {
    await prisma.score.create({
      data: {
        evaluationId: evaluation.id,
        subtestId: s.id,
        rawScore: Math.floor(Math.random() * 30) + 10,
        scaledScore: Math.floor(Math.random() * 10) + 5,
        percentile: Math.floor(Math.random() * 90) + 5,
      },
    })
  }

  await prisma.report.create({
    data: {
      evaluationId: evaluation.id,
      diagnosticImpressions: {
        create: [
          {
            dsm5Code: "F90.0",
            icd11Code: "6A01.0",
            severity: Severity.MODERATE,
            evidence:
              "Inattention symptoms observed during testing, parent and teacher ratings confirm clinical significance",
          },
        ],
      },
      narrativeSections: {
        create: [
          {
            section: NarrativeSectionType.REFERRAL,
            content:
              "Emma was referred for psychoeducational evaluation by her school counselor due to academic difficulties and attention problems.",
          },
          {
            section: NarrativeSectionType.BACKGROUND,
            content:
              "Emma is an 11-year-old student in 5th grade. Developmental milestones were met on time.",
          },
        ],
      },
      recommendations: {
        create: [
          {
            category: RecommendationCategory.ACADEMIC_ACCOMMODATIONS,
            description:
              "Extended time on tests and assignments (50% additional time)",
            priority: Priority.HIGH,
          },
        ],
      },
    },
  })

  console.log("Database seeded successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
