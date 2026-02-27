import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { AssessmentsClient } from "./assessments-client"
import { prisma } from "@/lib/prisma"

export default async function AssessmentsPage() {
  const assessments = await prisma.assessment.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { subtests: true }
      }
    }
  })

  // Format the data for the client
  const formattedAssessments = assessments.map(a => ({
    ...a,
    subtestCount: a._count.subtests
  }))

  // Get some basic stats for the dashboard
  const domainStats = await prisma.assessment.groupBy({
    by: ['domain'],
    _count: true,
  }).then(res => res.map(r => ({ domain: r.domain, count: r._count })))

  const platformStats = await prisma.assessment.groupBy({
    by: ['platform'],
    _count: true,
  }).then(res => res.map(r => ({ platform: r.platform, count: r._count })))

  const patients = await prisma.patient.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: 'asc' }
  })

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <AssessmentsClient 
            initialAssessments={formattedAssessments} 
            domainStats={domainStats}
            platformStats={platformStats}
            patients={patients}
            users={users}
          />
        </main>
      </div>
    </div>
  )
}
