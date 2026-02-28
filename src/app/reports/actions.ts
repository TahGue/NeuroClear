"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireStaffSession } from "@/lib/rbac"
import { NarrativeSectionType, RecommendationCategory, Priority } from "@prisma/client"

const UpsertNarrativeSchema = z.object({
  reportId: z.string().min(1),
  section: z.nativeEnum(NarrativeSectionType),
  content: z.string(),
})

export async function upsertNarrativeSection(input: unknown) {
  try {
    await requireStaffSession()
    const parsed = UpsertNarrativeSchema.parse(input)

    const section = await prisma.narrativeSection.upsert({
      where: {
        reportId_section: {
          reportId: parsed.reportId,
          section: parsed.section,
        },
      },
      create: {
        reportId: parsed.reportId,
        section: parsed.section,
        content: parsed.content,
      },
      update: {
        content: parsed.content,
      },
    })

    revalidatePath("/reports")
    revalidatePath(`/reports/${parsed.reportId}`)
    return { success: true, section }
  } catch (error) {
    console.error("Failed to upsert narrative section:", error)
    return { success: false, error: "Failed to save section" }
  }
}

const UpsertRecommendationSchema = z.object({
  id: z.string().optional(),
  reportId: z.string().min(1),
  category: z.nativeEnum(RecommendationCategory),
  description: z.string().min(1),
  priority: z.nativeEnum(Priority),
})

export async function upsertRecommendation(input: unknown) {
  try {
    await requireStaffSession()
    const parsed = UpsertRecommendationSchema.parse(input)

    let recommendation
    if (parsed.id) {
      recommendation = await prisma.recommendation.update({
        where: { id: parsed.id },
        data: {
          category: parsed.category,
          description: parsed.description,
          priority: parsed.priority,
        },
      })
    } else {
      recommendation = await prisma.recommendation.create({
        data: {
          reportId: parsed.reportId,
          category: parsed.category,
          description: parsed.description,
          priority: parsed.priority,
        },
      })
    }

    revalidatePath("/reports")
    revalidatePath(`/reports/${parsed.reportId}`)
    return { success: true, recommendation }
  } catch (error) {
    console.error("Failed to upsert recommendation:", error)
    return { success: false, error: "Failed to save recommendation" }
  }
}

const DeleteRecommendationSchema = z.object({
  id: z.string().min(1),
})

export async function deleteRecommendation(input: unknown) {
  try {
    await requireStaffSession()
    const parsed = DeleteRecommendationSchema.parse(input)

    await prisma.recommendation.delete({
      where: { id: parsed.id },
    })

    revalidatePath("/reports")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete recommendation:", error)
    return { success: false, error: "Failed to delete recommendation" }
  }
}
