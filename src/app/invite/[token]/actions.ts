"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { scoreInstrument } from "@/lib/instrument-scoring"
import { logAuditAction } from "@/lib/audit"

async function requireValidToken(token: string, sessionId: string) {
  const assignment = await prisma.instrumentAssignment.findUnique({
    where: { token },
  })

  if (!assignment) {
    throw new Error("Invalid token")
  }

  const sessionRecord = await prisma.instrumentSession.findUnique({
    where: { id: sessionId },
    select: { id: true, patientId: true, instrumentId: true },
  })

  if (!sessionRecord || sessionRecord.patientId !== assignment.patientId || sessionRecord.instrumentId !== assignment.instrumentId) {
    throw new Error("Unauthorized")
  }

  return { patientId: assignment.patientId, instrumentId: assignment.instrumentId }
}

const SaveResponseSchema = z.object({
  token: z.string().min(1),
  sessionId: z.string().min(1),
  itemId: z.string().min(1),
  value: z.number().int().min(0).max(10),
})

export async function saveInstrumentResponse(input: unknown) {
  const { token, sessionId, itemId, value } = SaveResponseSchema.parse(input)

  await requireValidToken(token, sessionId)

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

  revalidatePath(`/invite/${token}`)
  return { success: true }
}

const SubmitSchema = z.object({
  token: z.string().min(1),
  sessionId: z.string().min(1),
})

export async function submitInstrumentSession(input: unknown) {
  const { token, sessionId } = SubmitSchema.parse(input)

  const { patientId } = await requireValidToken(token, sessionId)

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

  const scored = scoreInstrument(session.instrument.slug, session.responses)

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

  await logAuditAction(patientId, "SUBMITTED_INSTRUMENT_INVITE", {
    instrumentId: session.instrumentId,
    sessionId: session.id,
    totalScore: scored.totalScore,
    interpretation: scored.interpretation,
    token
  })

  revalidatePath(`/invite/${token}`)

  return { success: true }
}
