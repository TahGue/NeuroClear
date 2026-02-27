"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const SaveResponseSchema = z.object({
  sessionId: z.string().min(1),
  itemId: z.string().min(1),
  value: z.number().int().min(0).max(3),
})

export async function saveInstrumentResponse(input: unknown) {
  const { sessionId, itemId, value } = SaveResponseSchema.parse(input)

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

  const session = await prisma.instrumentSession.findUnique({
    where: { id: sessionId },
    include: {
      instrument: true,
      responses: true,
    },
  })

  if (!session) return { success: false, error: "Session not found" }

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
