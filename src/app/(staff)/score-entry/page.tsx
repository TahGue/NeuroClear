import { ScoreEntryClient } from "./score-entry-client"
import { prisma } from "@/lib/prisma"

export default async function ScoreEntryPage() {
  const patients = await prisma.patient.findMany({
    orderBy: { lastName: 'asc' }
  })
  
  const assessments = await prisma.assessment.findMany({
    orderBy: { name: 'asc' },
    include: { subtests: true }
  })

  return (
    <ScoreEntryClient 
      initialPatients={patients} 
      initialAssessments={assessments} 
    />
  )
}
