'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createEvaluation(data: any) {
  try {
    const evaluation = await prisma.evaluation.create({
      data: {
        patientId: data.patientId,
        assessmentId: data.assessmentId,
        status: 'IN_PROGRESS',
        administeredDate: new Date(data.adminDate),
        administeredBy: data.adminBy,
      }
    })

    // If subtests with scores were provided
    if (data.subtests && data.subtests.length > 0) {
      const scorePromises = data.subtests
        .filter((s: any) => s.rawScore || s.scaledScore)
        .map(async (subtest: any) => {
          // In a real app we'd map the name to a real Subtest ID from the db
          // For now, let's find the matching subtest for this assessment
          const dbSubtest = await prisma.subtest.findFirst({
            where: {
              assessmentId: data.assessmentId,
              name: subtest.name
            }
          })

          if (dbSubtest) {
            return prisma.score.create({
              data: {
                evaluationId: evaluation.id,
                subtestId: dbSubtest.id,
                rawScore: subtest.rawScore ? parseInt(subtest.rawScore) : null,
                scaledScore: subtest.scaledScore ? parseInt(subtest.scaledScore) : null,
              }
            })
          }
        })

      await Promise.all(scorePromises.filter(Boolean))
    }

    revalidatePath('/dashboard')
    revalidatePath('/patients')
    revalidatePath(`/patients/${data.patientId}`)
    
    return { success: true, evaluationId: evaluation.id }
  } catch (error) {
    console.error('Failed to save evaluation:', error)
    return { success: false, error: 'Failed to save evaluation' }
  }
}

export async function generateReport(evaluationId: string) {
  try {
    // Basic auto-generation logic
    const report = await prisma.report.create({
      data: {
        evaluationId,
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
