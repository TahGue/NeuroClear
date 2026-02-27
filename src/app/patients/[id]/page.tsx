import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { PatientDetailClient } from "./patient-detail-client"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

async function getPatientData(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      evaluations: {
        include: {
          assessment: true,
          report: true
        },
        orderBy: {
          administeredDate: 'desc'
        }
      }
    }
  })

  return patient
}

export default async function PatientDetail({ params }: { params: { id: string } }) {
  const { id } = await params
  const patient = await getPatientData(id)

  if (!patient) {
    notFound()
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <PatientDetailClient patient={patient} />
        </main>
      </div>
    </div>
  )
}
