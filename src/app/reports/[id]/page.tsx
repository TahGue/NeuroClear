import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ReportBuilderClient } from "./report-builder-client"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

export const dynamic = "force-dynamic"

export default async function ReportBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      evaluation: {
        include: {
          patient: true,
          assessment: true,
          scores: {
            include: {
              subtest: true,
            },
          },
        },
      },
      diagnosticImpressions: true,
      narrativeSections: true,
      recommendations: true,
    },
  })

  if (!report) {
    notFound()
  }

  const reportData = {
    id: report.id,
    patientId: report.evaluation.patientId,
    patientName: `${report.evaluation.patient.firstName} ${report.evaluation.patient.lastName}`,
    evaluationId: report.evaluationId,
    assessment: report.evaluation.assessment.name,
    generatedDate: report.evaluation.createdAt,
    status: report.evaluation.status,
    diagnosticImpressions: report.diagnosticImpressions,
    narrativeSections: report.narrativeSections,
    recommendations: report.recommendations,
    scores: report.evaluation.scores,
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ReportBuilderClient initialReport={reportData} />
        </main>
      </div>
    </div>
  )
}
