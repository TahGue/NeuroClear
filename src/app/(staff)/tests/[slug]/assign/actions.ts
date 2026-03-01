"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function assignTestToPatient({
  patientId,
  testSlug,
  dueDate,
}: {
  patientId: string
  testSlug: string
  dueDate?: string
}) {
  try {
    // Get the instrument (English version as base)
    const instrument = await prisma.instrument.findFirst({
      where: { slug: testSlug, locale: "en" },
    })

    if (!instrument) {
      return { success: false, error: "Test not found" }
    }

    // Check if assignment already exists
    const existing = await prisma.instrumentAssignment.findFirst({
      where: {
        patientId,
        instrumentId: instrument.id,
      },
    })

    if (existing) {
      return { success: false, error: "Test already assigned to this patient" }
    }

    // Create the assignment
    await prisma.instrumentAssignment.create({
      data: {
        patientId,
        instrumentId: instrument.id,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    })

    revalidatePath("/tests")
    revalidatePath(`/patients/${patientId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Error assigning test:", error)
    return { success: false, error: "Failed to assign test" }
  }
}
