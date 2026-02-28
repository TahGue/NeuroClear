import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ScoreEntryClient } from "./score-entry-client"
import { prisma } from "@/lib/prisma"
import { requireStaffSession } from "@/lib/rbac"

export default async function ScoreEntryPage() {
  await requireStaffSession()
  const patients = await prisma.patient.findMany({
    orderBy: { lastName: 'asc' }
  })
  
  const assessments = await prisma.assessment.findMany({
    orderBy: { name: 'asc' },
    include: { subtests: true }
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ScoreEntryClient 
            initialPatients={patients} 
            initialAssessments={assessments} 
          />
        </main>
      </div>
    </div>
  )
}
