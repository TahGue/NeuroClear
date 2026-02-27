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
  await prisma.instrumentAssignment.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.instrumentResponse.deleteMany()
  await prisma.instrumentResult.deleteMany()
  await prisma.instrumentSession.deleteMany()
  await prisma.instrumentItem.deleteMany()
  await prisma.instrument.deleteMany()
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
      dateOfBirth: new Date("2012-03-15"),
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

  const likert = [
    { label: "Not at all", value: 0 },
    { label: "Several days", value: 1 },
    { label: "More than half the days", value: 2 },
    { label: "Nearly every day", value: 3 },
  ]

  const phq9 = await prisma.instrument.create({
    data: {
      slug: "phq9",
      name: "PHQ-9",
      description: "Patient Health Questionnaire-9 (Depression screener)",
      minAgeYears: 13,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Little interest or pleasure in doing things", options: likert },
          { order: 2, prompt: "Feeling down, depressed, or hopeless", options: likert },
          { order: 3, prompt: "Trouble falling or staying asleep, or sleeping too much", options: likert },
          { order: 4, prompt: "Feeling tired or having little energy", options: likert },
          { order: 5, prompt: "Poor appetite or overeating", options: likert },
          { order: 6, prompt: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: likert },
          { order: 7, prompt: "Trouble concentrating on things, such as reading the newspaper or watching television", options: likert },
          { order: 8, prompt: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", options: likert },
          { order: 9, prompt: "Thoughts that you would be better off dead or of hurting yourself in some way", options: likert },
        ],
      },
    },
  })

  const sdqOptions = [
    { label: "Not true", value: 0 },
    { label: "Somewhat true", value: 1 },
    { label: "Certainly true", value: 2 },
  ]

  const sdq = await prisma.instrument.create({
    data: {
      slug: "sdq",
      name: "SDQ (Short)",
      description: "Strengths and Difficulties Questionnaire (sample short form)",
      minAgeYears: 6,
      maxAgeYears: 12,
      audience: InstrumentAudience.PARENT,
      items: {
        create: [
          { order: 1, prompt: "Often loses temper", options: sdqOptions },
          { order: 2, prompt: "Generally obedient", options: sdqOptions },
          { order: 3, prompt: "Many worries", options: sdqOptions },
        ],
      },
    },
  })

  const phqa = await prisma.instrument.create({
    data: {
      slug: "phqa",
      name: "PHQ-A (Short)",
      description: "Patient Health Questionnaire for Adolescents (sample short form)",
      minAgeYears: 13,
      maxAgeYears: 17,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Feeling down, depressed, or hopeless", options: likert },
          { order: 2, prompt: "Little interest or pleasure in doing things", options: likert },
          { order: 3, prompt: "Trouble concentrating", options: likert },
        ],
      },
    },
  })

  const asrsOptions = [
    { label: "Never", value: 0 },
    { label: "Rarely", value: 1 },
    { label: "Sometimes", value: 2 },
    { label: "Often", value: 3 },
    { label: "Very Often", value: 4 },
  ]

  const asrs = await prisma.instrument.create({
    data: {
      slug: "asrs",
      name: "ASRS (Short)",
      description: "Adult ADHD Self-Report Scale (sample short form)",
      minAgeYears: 18,
      maxAgeYears: 64,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Trouble wrapping up final details of a project", options: asrsOptions },
          { order: 2, prompt: "Difficulty getting things in order", options: asrsOptions },
          { order: 3, prompt: "Problems remembering appointments", options: asrsOptions },
        ],
      },
    },
  })

  const gdsOptions = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 },
  ]

  const gds15 = await prisma.instrument.create({
    data: {
      slug: "gds15",
      name: "GDS-15 (Short)",
      description: "Geriatric Depression Scale (sample short form)",
      minAgeYears: 65,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Are you basically satisfied with your life?", options: gdsOptions },
          { order: 2, prompt: "Do you feel that your life is empty?", options: gdsOptions },
          { order: 3, prompt: "Do you often feel helpless?", options: gdsOptions },
        ],
      },
    },
  })

  const gad7 = await prisma.instrument.create({
    data: {
      slug: "gad7",
      name: "GAD-7",
      description: "Generalized Anxiety Disorder 7-item screener",
      minAgeYears: 13,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "Feeling nervous, anxious or on edge", options: likert },
          { order: 2, prompt: "Not being able to stop or control worrying", options: likert },
          { order: 3, prompt: "Worrying too much about different things", options: likert },
          { order: 4, prompt: "Trouble relaxing", options: likert },
          { order: 5, prompt: "Being so restless that it is hard to sit still", options: likert },
          { order: 6, prompt: "Becoming easily annoyed or irritable", options: likert },
          { order: 7, prompt: "Feeling afraid as if something awful might happen", options: likert },
        ],
      },
    },
  })

  const auditOptions = [
    { label: "Never", value: 0 },
    { label: "Monthly or less", value: 1 },
    { label: "2–4 times a month", value: 2 },
    { label: "2–3 times a week", value: 3 },
  ]

  const audit = await prisma.instrument.create({
    data: {
      slug: "audit",
      name: "AUDIT",
      description: "Alcohol Use Disorders Identification Test (WHO)",
      minAgeYears: 18,
      audience: InstrumentAudience.PATIENT,
      items: {
        create: [
          { order: 1, prompt: "How often do you have a drink containing alcohol?", options: auditOptions },
          { order: 2, prompt: "How many drinks containing alcohol do you have on a typical day when you are drinking?", options: [
            { label: "1 or 2", value: 0 },
            { label: "3 or 4", value: 1 },
            { label: "5 or 6", value: 2 },
            { label: "7 to 9", value: 3 },
          ] },
          { order: 3, prompt: "How often do you have six or more drinks on one occasion?", options: auditOptions },
          { order: 4, prompt: "How often during the last year have you found that you were not able to stop drinking once you had started?", options: auditOptions },
          { order: 5, prompt: "How often during the last year have you failed to do what was normally expected from you because of drinking?", options: auditOptions },
          { order: 6, prompt: "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?", options: auditOptions },
          { order: 7, prompt: "How often during the last year have you had a feeling of guilt or remorse after drinking?", options: auditOptions },
          { order: 8, prompt: "How often during the last year have you been unable to remember what happened the night before because you had been drinking?", options: auditOptions },
          { order: 9, prompt: "Have you or someone else been injured because of your drinking?", options: [
            { label: "No", value: 0 },
            { label: "Yes, but not in the last year", value: 2 },
            { label: "Yes, during the last year", value: 3 },
            { label: "Prefer not to say", value: 0 },
          ] },
          { order: 10, prompt: "Has a relative, friend, doctor, or other health worker been concerned about your drinking or suggested you cut down?", options: [
            { label: "No", value: 0 },
            { label: "Yes, but not in the last year", value: 2 },
            { label: "Yes, during the last year", value: 3 },
            { label: "Prefer not to say", value: 0 },
          ] },
        ],
      },
    },
  })

  await prisma.instrumentAssignment.createMany({
    data: [
      {
        patientId: childPatient.id,
        instrumentId: sdq.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adolescentPatient.id,
        instrumentId: phqa.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: phq9.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: gad7.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: audit.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: adultPatient.id,
        instrumentId: asrs.id,
        assignedByUserId: adminUser.id,
        status: InstrumentAssignmentStatus.ASSIGNED,
      },
      {
        patientId: olderAdultPatient.id,
        instrumentId: gds15.id,
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
