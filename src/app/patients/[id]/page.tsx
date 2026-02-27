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
      },
      instrumentAssignments: {
        include: {
          instrument: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      instrumentSessions: {
        include: {
          instrument: true,
          result: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    }
  })

  return patient
}

async function getActiveInstruments() {
  return prisma.instrument.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  })
}

export default async function PatientDetail({ params }: { params: { id: string } }) {
  const { id } = await params
  const patient = await getPatientData(id)
  const instruments = await getActiveInstruments()

  if (!patient) {
    notFound()
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <PatientDetailClient patient={patient} instruments={instruments} />
        </main>
      </div>
    </div>
  )
}
