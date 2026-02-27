"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function requirePatientSession() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const patientId = session?.user?.patientId

  if (!session?.user || role !== "PATIENT" || !patientId) {
    throw new Error("Unauthorized")
  }

  return { session, patientId }
}

async function requireSessionOwnsInstrumentSession(sessionId: string) {
  const { patientId } = await requirePatientSession()

  const sessionRecord = await prisma.instrumentSession.findUnique({
    where: { id: sessionId },
    select: { id: true, patientId: true },
  })

  if (!sessionRecord || sessionRecord.patientId !== patientId) {
    throw new Error("Unauthorized")
  }

  return { patientId }
}

const SaveResponseSchema = z.object({
  sessionId: z.string().min(1),
  itemId: z.string().min(1),
  value: z.number().int().min(0).max(3),
})

export async function saveInstrumentResponse(input: unknown) {
  const { sessionId, itemId, value } = SaveResponseSchema.parse(input)

  await requireSessionOwnsInstrumentSession(sessionId)

  const session = await prisma.instrumentSession.findUnique({
    where: { id: sessionId },
    select: { status: true },
  })

  if (!session) return { success: false, error: "Session not found" }
  if (session.status === "SUBMITTED") {
    return { success: false, error: "Session already submitted" }
  }

  await prisma.instrumentResponse.upsert({
    where: { sessionId_itemId: { sessionId, itemId } },
    create: { sessionId, itemId, value },
    update: { value },
  })

  revalidatePath("/portal")
  revalidatePath("/portal/tests")
  return { success: true }
}

const SubmitSchema = z.object({
  sessionId: z.string().min(1),
})

function interpret(slug: string, total: number): string {
  switch (slug) {
    case "audit": {
      if (total <= 7) return "Low risk"
      if (total <= 15) return "Medium risk"
      if (total <= 19) return "High risk"
      return "Possible dependence"
    }
    case "phq9": {
      if (total <= 4) return "Minimal depression"
      if (total <= 9) return "Mild depression"
      if (total <= 14) return "Moderate depression"
      if (total <= 19) return "Moderately severe depression"
      return "Severe depression"
    }
    case "gad7": {
      if (total <= 4) return "Minimal anxiety"
      if (total <= 9) return "Mild anxiety"
      if (total <= 14) return "Moderate anxiety"
      return "Severe anxiety"
    }
    default:
      return "Completed"
  }
}

export async function submitInstrumentSession(input: unknown) {
  const { sessionId } = SubmitSchema.parse(input)

  await requireSessionOwnsInstrumentSession(sessionId)

  const session = await prisma.instrumentSession.findUnique({
    where: { id: sessionId },
    include: {
      instrument: true,
      responses: true,
    },
  })

  if (!session) return { success: false, error: "Session not found" }

  if (session.status === "SUBMITTED") {
    return { success: true }
  }

  const totalScore = session.responses.reduce<number>((sum, r) => sum + r.value, 0)
  const interpretation = interpret(session.instrument.slug, totalScore)

  await prisma.instrumentSession.update({
    where: { id: sessionId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      result: {
        upsert: {
          create: {
            totalScore,
            interpretation,
            details: { slug: session.instrument.slug },
          },
          update: {
            totalScore,
            interpretation,
            details: { slug: session.instrument.slug },
          },
        },
      },
    },
  })

  revalidatePath("/portal")
  revalidatePath("/portal/tests")
  revalidatePath(`/portal/tests/${session.instrument.slug}`)

  return { success: true }
}
