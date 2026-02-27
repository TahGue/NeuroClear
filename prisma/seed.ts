import { PrismaClient, AssessmentDomain, AssessmentPlatform, PatientStatus, EvaluationStatus, Severity, NarrativeSectionType, RecommendationCategory, Priority, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data (optional but good for dev)
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

  // 1. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@neuroclear.app',
      name: 'System Admin',
      role: UserRole.ADMIN,
      passwordHash: hashedPassword
    }
  })

  const clinicianUser = await prisma.user.create({
    data: {
      email: 'dr.smith@neuroclear.app',
      name: 'Dr. John Smith',
      role: UserRole.CLINICIAN,
      passwordHash: hashedPassword
    }
  })
  
  const staffUser = await prisma.user.create({
    data: {
      email: 'frontdesk@neuroclear.app',
      name: 'Front Desk Staff',
      role: UserRole.STAFF,
      passwordHash: hashedPassword
    }
  })

  // 1. Create Assessments
  const wiscV = await prisma.assessment.create({
    data: {
      name: 'WISC-V',
      domain: AssessmentDomain.COGNITIVE,
      platform: AssessmentPlatform.Q_INTERACTIVE,
      minAge: 6,
      maxAge: 16,
      description: 'Wechsler Intelligence Scale for Children - Fifth Edition',
      subtests: {
        create: [
          { name: 'Similarities', index: 'VCI' },
          { name: 'Vocabulary', index: 'VCI' },
          { name: 'Block Design', index: 'VSI' },
          { name: 'Visual Puzzles', index: 'VSI' },
          { name: 'Digit Span', index: 'WMI' },
          { name: 'Coding', index: 'PSI' },
          { name: 'Figure Weights', index: 'FRI' },
        ]
      }
    }
  })

  const waisIV = await prisma.assessment.create({
    data: {
      name: 'WAIS-IV',
      domain: AssessmentDomain.COGNITIVE,
      platform: AssessmentPlatform.Q_GLOBAL,
      minAge: 16,
      maxAge: 90,
      description: 'Wechsler Adult Intelligence Scale - Fourth Edition',
      subtests: {
        create: [
          { name: 'Similarities', index: 'VCI' },
          { name: 'Vocabulary', index: 'VCI' },
          { name: 'Information', index: 'VCI' },
          { name: 'Block Design', index: 'VSI' },
          { name: 'Digit Span', index: 'WMI' },
          { name: 'Coding', index: 'PSI' },
        ]
      }
    }
  })

  const basc3 = await prisma.assessment.create({
    data: {
      name: 'BASC-3',
      domain: AssessmentDomain.BEHAVIORAL,
      platform: AssessmentPlatform.MHS_ONLINE,
      minAge: 2,
      maxAge: 21,
      description: 'Behavior Assessment System for Children - Third Edition'
    }
  })

  const conners3 = await prisma.assessment.create({
    data: {
      name: 'Conners 3',
      domain: AssessmentDomain.BEHAVIORAL,
      platform: AssessmentPlatform.ALTO,
      minAge: 6,
      maxAge: 18,
      description: 'Conners 3rd Edition - ADHD assessment'
    }
  })

  // 2. Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'Emma',
      lastName: 'Thompson',
      dateOfBirth: new Date('2012-03-15'),
      referralSource: 'School Counselor',
      status: PatientStatus.ACTIVE,
    }
  })

  const patient2 = await prisma.patient.create({
    data: {
      firstName: 'Michael',
      lastName: 'Chen',
      dateOfBirth: new Date('2008-07-22'),
      referralSource: 'Parent',
      status: PatientStatus.ACTIVE,
    }
  })

  const patient3 = await prisma.patient.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: new Date('2015-11-08'),
      referralSource: 'Pediatrician',
      status: PatientStatus.INACTIVE,
    }
  })

  // 3. Create Evaluations
  const eval1 = await prisma.evaluation.create({
    data: {
      patientId: patient1.id,
      assessmentId: wiscV.id,
      status: EvaluationStatus.COMPLETED,
      administeredDate: new Date('2024-01-15'),
      administeredBy: 'Dr. Smith',
      notes: 'Cooperative during testing.',
    }
  })

  const eval2 = await prisma.evaluation.create({
    data: {
      patientId: patient2.id,
      assessmentId: waisIV.id,
      status: EvaluationStatus.IN_PROGRESS,
      administeredDate: new Date('2024-01-14'),
      administeredBy: 'Dr. Johnson',
    }
  })

  // 4. Create Scores for eval1
  const wiscVSubtests = await prisma.subtest.findMany({ where: { assessmentId: wiscV.id } })
  for (const subtest of wiscVSubtests) {
    await prisma.score.create({
      data: {
        evaluationId: eval1.id,
        subtestId: subtest.id,
        rawScore: Math.floor(Math.random() * 30) + 10,
        scaledScore: Math.floor(Math.random() * 10) + 5,
        percentile: Math.floor(Math.random() * 90) + 5,
      }
    })
  }

  // 5. Create Report for eval1
  const report1 = await prisma.report.create({
    data: {
      evaluationId: eval1.id,
      diagnosticImpressions: {
        create: [
          {
            dsm5Code: 'F90.0',
            icd11Code: '6A01.0',
            severity: Severity.MODERATE,
            evidence: 'Inattention symptoms observed during testing, parent and teacher ratings confirm clinical significance'
          }
        ]
      },
      narrativeSections: {
        create: [
          {
            section: NarrativeSectionType.REFERRAL,
            content: 'Emma was referred for psychoeducational evaluation by her school counselor due to academic difficulties and attention problems.'
          },
          {
            section: NarrativeSectionType.BACKGROUND,
            content: 'Emma is an 11-year-old student in 5th grade. Developmental milestones were met on time.'
          }
        ]
      },
      recommendations: {
        create: [
          {
            category: RecommendationCategory.ACADEMIC_ACCOMMODATIONS,
            description: 'Extended time on tests and assignments (50% additional time)',
            priority: Priority.HIGH
          },
          {
            category: RecommendationCategory.THERAPY,
            description: 'Executive functioning coaching for organization and planning',
            priority: Priority.MEDIUM
          }
        ]
      }
    }
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
