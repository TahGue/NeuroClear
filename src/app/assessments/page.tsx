import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { AssessmentsClient } from "./assessments-client"
import { prisma } from "@/lib/prisma"

async function getAssessmentsData() {
  const assessments = await prisma.assessment.findMany({
    include: {
      _count: {
        select: { subtests: true }
      }
    }
  })

  const assessmentsWithCount = assessments.map(a => ({
    ...a,
    subtestCount: a._count.subtests
  }))

  const domainStats = Object.keys(
    assessments.reduce((acc: Record<string, number>, a) => ({ ...acc, [a.domain]: (acc[a.domain] || 0) + 1 }), {})
  ).map(domain => ({
    domain,
    count: assessments.filter(a => a.domain === domain).length,
  }))

  const platformStats = Object.keys(
    assessments.reduce((acc: Record<string, number>, a) => ({ ...acc, [a.platform]: (acc[a.platform] || 0) + 1 }), {})
  ).map(platform => ({
    platform,
    count: assessments.filter(a => a.platform === platform).length,
  }))

  return { assessmentsWithCount, domainStats, platformStats }
}

export default async function AssessmentLibrary() {
  const { assessmentsWithCount, domainStats, platformStats } = await getAssessmentsData()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <AssessmentsClient 
            initialAssessments={assessmentsWithCount} 
            domainStats={domainStats}
            platformStats={platformStats}
          />
        </main>
      </div>
    </div>
  )
}
