"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requirePatientSession } from "@/lib/rbac"
import { scoreInstrument } from "@/lib/instrument-scoring"
import { logAuditAction } from "@/lib/audit"

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
  value: z.number().int().min(0).max(10),
})

export async function saveInstrumentResponse(input: unknown) {
  const { sessionId, itemId, value } = SaveResponseSchema.parse(input)

  await requireSessionOwnsInstrumentSession(sessionId)

  const session = await prisma.instrumentSession.findUnique({
    where: { id: sessionId },
    select: { status: true, instrumentId: true, patientId: true },
  })

  if (!session) return { success: false, error: "Session not found" }
  if (session.status === "SUBMITTED") {
    return { success: false, error: "Session already submitted" }
  }

  await prisma.$transaction([
    prisma.instrumentResponse.upsert({
      where: { sessionId_itemId: { sessionId, itemId } },
      create: { sessionId, itemId, value },
      update: { value },
    }),
    prisma.instrumentAssignment.updateMany({
      where: {
        patientId: session.patientId,
        instrumentId: session.instrumentId,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
      data: {
        status: "IN_PROGRESS",
      },
    }),
  ])

  revalidatePath("/portal")
  revalidatePath("/portal/tests")
  return { success: true }
}

const SubmitSchema = z.object({
  sessionId: z.string().min(1),
})

export async function submitInstrumentSession(input: unknown) {
  const { sessionId } = SubmitSchema.parse(input)

  await requireSessionOwnsInstrumentSession(sessionId)

  const session = await prisma.instrumentSession.findUnique({
    where: { id: sessionId },
    include: {
      instrument: {
        include: {
          _count: {
            select: { items: true }
          }
        }
      },
      responses: true,
    },
  })

  if (!session) return { success: false, error: "Session not found" }

  if (session.status === "SUBMITTED") {
    return { success: true }
  }

  const scored = scoreInstrument(session.instrument.slug, session.responses, session.instrument._count.items)

  await prisma.$transaction([
    prisma.instrumentSession.update({
      where: { id: sessionId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        result: {
          upsert: {
            create: {
              totalScore: scored.totalScore,
              interpretation: scored.interpretation,
              details: scored.details ?? { slug: session.instrument.slug },
            },
            update: {
              totalScore: scored.totalScore,
              interpretation: scored.interpretation,
              details: scored.details ?? { slug: session.instrument.slug },
            },
          },
        },
      },
    }),
    prisma.instrumentAssignment.updateMany({
      where: {
        patientId: session.patientId,
        instrumentId: session.instrumentId,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
      data: {
        status: "SUBMITTED",
      },
    }),
  ])

  const currentUser = await prisma.user.findUnique({ where: { patientId: session.patientId }, select: { id: true } })

  await logAuditAction(currentUser?.id || null, "SUBMITTED_INSTRUMENT", {
    instrumentId: session.instrumentId,
    sessionId: session.id,
    totalScore: scored.totalScore,
    interpretation: scored.interpretation
  })

  revalidatePath("/portal")
  revalidatePath("/portal/tests")
  revalidatePath(`/portal/tests/${session.instrument.slug}`)

  return { success: true }
}
