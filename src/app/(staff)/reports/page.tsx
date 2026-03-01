import { ReportsClient } from "./reports-client"
import { prisma } from "@/lib/prisma"

async function getReportsData() {
  const reports = await prisma.report.findMany({
    include: {
      evaluation: {
        include: {
          patient: true,
          assessment: true
        }
      },
      diagnosticImpressions: true,
      narrativeSections: true,
      recommendations: true
    },
    orderBy: {
      evaluation: {
        createdAt: 'desc'
      }
    }
  })

  return reports.map(r => ({
    id: r.id,
    patientId: r.evaluation.patientId,
    patientName: `${r.evaluation.patient.firstName} ${r.evaluation.patient.lastName}`,
    evaluationId: r.evaluationId,
    assessment: r.evaluation.assessment.name,
    generatedDate: r.evaluation.createdAt,
    status: r.evaluation.status,
    diagnosticImpressions: r.diagnosticImpressions,
    narrativeSections: r.narrativeSections,
    recommendations: r.recommendations,
  }))
}

export default async function ReportsPage() {
  const reports = await getReportsData()

  return (
    <ReportsClient initialReports={reports} />
  )
}
