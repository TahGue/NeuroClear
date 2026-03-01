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
  InstrumentAudience,
  InstrumentAssignmentStatus,
  InstrumentCategory,
  UserRole,
} from "@prisma/client"
import * as bcrypt from "bcryptjs"
import * as fs from "fs"
import * as path from "path"

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
  await prisma.instrumentAssignment.deleteMany()
  await prisma.instrumentResponse.deleteMany()
  await prisma.instrumentResult.deleteMany()
  await prisma.instrumentSession.deleteMany()
  await prisma.instrumentItem.deleteMany()
  await prisma.instrument.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash("password123", 10)

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@neuroclear.app",
      name: "System Admin",
      role: UserRole.ADMIN,
      passwordHash,
    },
  })

  const childPatient = await prisma.patient.create({
    data: {
      firstName: "Emma",
      lastName: "Thompson",
      dateOfBirth: new Date("2015-03-15"),
      referralSource: "School Counselor",
      status: PatientStatus.ACTIVE,
    },
  })

  const adolescentPatient = await prisma.patient.create({
    data: {
      firstName: "Noah",
      lastName: "Martin",
      dateOfBirth: new Date("2009-06-10"),
      referralSource: "Pediatrician",
      status: PatientStatus.ACTIVE,
    },
  })

  const adultPatient = await prisma.patient.create({
    data: {
      firstName: "Sophia",
      lastName: "Garcia",
      dateOfBirth: new Date("1993-11-02"),
      referralSource: "Self",
      status: PatientStatus.ACTIVE,
    },
  })

  const olderAdultPatient = await prisma.patient.create({
    data: {
      firstName: "William",
      lastName: "Johnson",
      dateOfBirth: new Date("1948-04-22"),
      referralSource: "Primary Care",
      status: PatientStatus.ACTIVE,
    },
  })

  await prisma.user.create({
    data: {
      email: "emma.patient@neuroclear.app",
      name: "Emma Thompson",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: childPatient.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "noah.adolescent@neuroclear.app",
      name: "Noah Martin",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: adolescentPatient.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "sophia.adult@neuroclear.app",
      name: "Sophia Garcia",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: adultPatient.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "william.senior@neuroclear.app",
      name: "William Johnson",
      role: UserRole.PATIENT,
      passwordHash,
      patientId: olderAdultPatient.id,
    },
  })

  const instrumentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/en.json'), 'utf-8'));
  
  // Seed instruments for all locales
  const locales = ['en', 'fr', 'ar', 'sv'] as const;
  
  for (const locale of locales) {
    const localePath = path.join(__dirname, 'data', `${locale}.json`)
    if (!fs.existsSync(localePath)) continue
    
    const localeData = JSON.parse(fs.readFileSync(localePath, 'utf-8'))
    
    for (const instrumentData of localeData) {
      const existing = await prisma.instrument.findFirst({
        where: { slug: instrumentData.slug, locale }
      });
      
      if (existing) {
        await prisma.instrument.update({
          where: { id: existing.id },
          data: {
            name: instrumentData.name,
            description: instrumentData.description,
            category: instrumentData.category as InstrumentCategory ?? InstrumentCategory.COGNITIVE,
            minAgeYears: instrumentData.minAgeYears,
            maxAgeYears: instrumentData.maxAgeYears,
            audience: instrumentData.audience,
          },
        });
      } else {
        await prisma.instrument.create({
          data: {
            slug: instrumentData.slug,
            locale,
            name: instrumentData.name,
            description: instrumentData.description,
            category: instrumentData.category as InstrumentCategory ?? InstrumentCategory.COGNITIVE,
            minAgeYears: instrumentData.minAgeYears,
            maxAgeYears: instrumentData.maxAgeYears,
            audience: instrumentData.audience,
            items: {
              create: instrumentData.items
            }
          }
        });
      }
    }
  }

  const allInstruments = await prisma.instrument.findMany();
  const getInst = (slug: string) => {
    const inst = allInstruments.find(i => i.slug === slug);
    if (!inst) throw new Error("Missing instrument: " + slug);
    return inst;
  };

  await prisma.instrumentAssignment.createMany({
    data: [
      {
        patientId: childPatient.id,
        instrumentId: getInst("sdq").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.SUBMITTED,
      },
      {
        patientId: childPatient.id,
        instrumentId: getInst("child-emotion-masks").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: childPatient.id,
        instrumentId: getInst("child-pattern-weaving").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adolescentPatient.id,
        instrumentId: getInst("phqa").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adolescentPatient.id,
        instrumentId: getInst("teen-social-harmony").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("phq9").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.SUBMITTED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("gad7").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("audit").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("adult-debate-evidence").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: getInst("gds15").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: getInst("senior-wisdom-ambiguity").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: getInst("senior-gentle-attention").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: getInst("senior-life-chapters").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Matrix Reasoning IQ Tests
      {
        patientId: childPatient.id,
        instrumentId: getInst("matrix-reasoning-child").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adolescentPatient.id,
        instrumentId: getInst("matrix-reasoning-child").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("matrix-reasoning-adult").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: getInst("matrix-reasoning-adult").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Comprehensive IQ Test (adults 16+)
      {
        patientId: adultPatient.id,
        instrumentId: getInst("comprehensive-iq").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: getInst("comprehensive-iq").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Stroop Test (all ages 7+)
      {
        patientId: childPatient.id,
        instrumentId: getInst("stroop-test").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adolescentPatient.id,
        instrumentId: getInst("stroop-test").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("stroop-test").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Digit Span (all ages)
      {
        patientId: childPatient.id,
        instrumentId: getInst("digit-span").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("digit-span").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Go/No-Go (all ages)
      {
        patientId: childPatient.id,
        instrumentId: getInst("go-no-go").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("go-no-go").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Schulte Table (all ages 7+)
      {
        patientId: adolescentPatient.id,
        instrumentId: getInst("schulte-table").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("schulte-table").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Reaction Time (all ages)
      {
        patientId: childPatient.id,
        instrumentId: getInst("reaction-time").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("reaction-time").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      // Dual N-Back (ages 12+)
      {
        patientId: adolescentPatient.id,
        instrumentId: getInst("dual-n-back").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: getInst("dual-n-back").id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
    ],
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
      patientId: childPatient.id,
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
