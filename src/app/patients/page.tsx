import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { PatientsClient } from "./patients-client"
import { prisma } from "@/lib/prisma"
import { requireStaffSession } from "@/lib/rbac"

async function getPatients() {
  const patients = await prisma.patient.findMany({
    include: {
      evaluations: {
        include: {
          assessment: true
        },
        orderBy: {
          administeredDate: 'desc'
        }
      }
    },
    orderBy: {
      lastName: 'asc'
    }
  })

  return patients.map(p => {
    const activeEvals = p.evaluations.filter(e => e.status === 'IN_PROGRESS' || e.status === 'PENDING_REVIEW')
    const completedEvals = p.evaluations.filter(e => e.status === 'COMPLETED' && e.administeredDate)
    
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      referralSource: p.referralSource,
      status: p.status,
      activeTestBatteries: activeEvals.map(e => e.assessment.name),
      lastEvaluation: completedEvals.length > 0 ? completedEvals[0].administeredDate : null
    }
  })
}

export default async function PatientsPage() {
  await requireStaffSession()
  const patients = await getPatients()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <PatientsClient initialPatients={patients} />
        </main>
      </div>
    </div>
  )
}
