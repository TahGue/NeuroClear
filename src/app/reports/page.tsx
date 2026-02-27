import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ReportsClient initialReports={reports} />
        </main>
      </div>
    </div>
  )
}
