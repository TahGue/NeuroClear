'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

async function requireStaffSession() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || !role || role === 'PATIENT') {
    throw new Error('Unauthorized')
  }
  return session
}

const createEvaluationSchema = z.object({
  patientId: z.string().min(1),
  assessmentId: z.string().min(1),
  adminDate: z.string().optional(),
  adminBy: z.string().optional(),
  subtests: z
    .array(
      z.object({
        name: z.string().min(1),
        rawScore: z.union([z.string(), z.number()]).optional(),
        scaledScore: z.union([z.string(), z.number()]).optional(),
      })
    )
    .optional(),
})

const assignEvaluationSchema = z.object({
  patientId: z.string().min(1),
  assessmentId: z.string().min(1),
  assignedTo: z.string().nullable().optional(),
})

const generateReportSchema = z.object({
  evaluationId: z.string().min(1),
})

export async function createEvaluation(data: unknown) {
  try {
    await requireStaffSession()
    const parsed = createEvaluationSchema.parse(data)

    const evaluation = await prisma.evaluation.create({
      data: {
        patientId: parsed.patientId,
        assessmentId: parsed.assessmentId,
        status: 'IN_PROGRESS',
        administeredDate: parsed.adminDate ? new Date(parsed.adminDate) : null,
        administeredBy: parsed.adminBy || null,
      }
    })

    // If subtests with scores were provided
    if (parsed.subtests && parsed.subtests.length > 0) {
      const scorePromises = parsed.subtests
        .filter((s) => s.rawScore || s.scaledScore)
        .map(async (subtest) => {
          // In a real app we'd map the name to a real Subtest ID from the db
          // For now, let's find the matching subtest for this assessment
          const dbSubtest = await prisma.subtest.findFirst({
            where: {
              assessmentId: parsed.assessmentId,
              name: subtest.name
            }
          })

          if (dbSubtest) {
            const rawScore = typeof subtest.rawScore === 'string' ? subtest.rawScore : subtest.rawScore?.toString()
            const scaledScore = typeof subtest.scaledScore === 'string' ? subtest.scaledScore : subtest.scaledScore?.toString()
            return prisma.score.create({
              data: {
                evaluationId: evaluation.id,
                subtestId: dbSubtest.id,
                rawScore: rawScore ? parseInt(rawScore) : null,
                scaledScore: scaledScore ? parseInt(scaledScore) : null,
              }
            })
          }
        })

      await Promise.all(scorePromises.filter(Boolean))
    }

    revalidatePath('/dashboard')
    revalidatePath('/patients')
    revalidatePath(`/patients/${parsed.patientId}`)
    
    return { success: true, evaluationId: evaluation.id }
  } catch (error) {
    console.error('Failed to save evaluation:', error)
    return { success: false, error: 'Failed to save evaluation' }
  }
}

export async function assignEvaluation(patientId: string, assessmentId: string, assignedTo: string | null = null) {
  try {
    await requireStaffSession()
    const parsed = assignEvaluationSchema.parse({ patientId, assessmentId, assignedTo })

    const evaluation = await prisma.evaluation.create({
      data: {
        patientId: parsed.patientId,
        assessmentId: parsed.assessmentId,
        status: 'PENDING_REVIEW', // Using pending_review to indicate it's assigned but not started
        administeredBy: parsed.assignedTo ?? null,
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/patients')
    revalidatePath(`/patients/${parsed.patientId}`)
    
    return { success: true, evaluationId: evaluation.id }
  } catch (error) {
    console.error('Failed to assign evaluation:', error)
    return { success: false, error: 'Failed to assign evaluation' }
  }
}

export async function generateReport(evaluationId: string) {
  try {
    await requireStaffSession()
    const parsed = generateReportSchema.parse({ evaluationId })

    // Basic auto-generation logic
    const report = await prisma.report.create({
      data: {
        evaluationId: parsed.evaluationId,
        narrativeSections: {
          create: [
            {
              section: 'REFERRAL',
              content: 'Patient was referred for comprehensive psychological evaluation.'
            },
            {
              section: 'OBSERVATIONS',
              content: 'Patient was cooperative during the testing session.'
            }
          ]
        }
      }
    })

    revalidatePath('/reports')
    return { success: true, reportId: report.id }
  } catch (error) {
    console.error('Failed to generate report:', error)
    return { success: false, error: 'Failed to generate report' }
  }
}
