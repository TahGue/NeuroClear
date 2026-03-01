import { prisma } from "@/lib/prisma"
import { InstrumentRunner } from "@/components/instruments/InstrumentRunner"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requirePatientSession } from "@/lib/rbac"
import { saveInstrumentResponse, submitInstrumentSession } from "../actions"

export const dynamic = "force-dynamic"

function getAgeYears(dateOfBirth: Date, now: Date = new Date()) {
  let age = now.getFullYear() - dateOfBirth.getFullYear()
  const m = now.getMonth() - dateOfBirth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dateOfBirth.getDate())) age -= 1
  return age
}

function isInstrumentInAgeRange(
  ageYears: number,
  instrument: { minAgeYears: number | null; maxAgeYears: number | null }
) {
  if (instrument.minAgeYears !== null && ageYears < instrument.minAgeYears) return false
  if (instrument.maxAgeYears !== null && ageYears > instrument.maxAgeYears) return false
  return true
}

type ItemOption = { label: string; value: number }
type Item = { id: string; order: number; prompt: string; options: ItemOption[] }

const ItemOptionSchema = z.object({
  label: z.string(),
  value: z.number(),
})

const ItemOptionsSchema = z.array(ItemOptionSchema)

export default async function InstrumentRunPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { patientId } = await requirePatientSession()

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { dateOfBirth: true },
  })

  if (!patient) redirect("/portal")

  const ageYears = getAgeYears(patient.dateOfBirth)

  const instrument = await prisma.instrument.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { order: "asc" } },
    },
  })

  if (!instrument) redirect("/portal/tests")

  if (instrument.status !== "ACTIVE") redirect("/portal/tests")

  if (!isInstrumentInAgeRange(ageYears, { minAgeYears: instrument.minAgeYears, maxAgeYears: instrument.maxAgeYears })) {
    redirect("/portal/tests")
  }

  const runnerItems: Item[] = instrument.items.map((it) => {
    const parsedOptions = ItemOptionsSchema.safeParse(it.options)
    return {
      id: it.id,
      order: it.order,
      prompt: it.prompt,
      options: parsedOptions.success ? parsedOptions.data : [],
    }
  })

  const existing = await prisma.instrumentSession.findFirst({
    where: {
      patientId,
      instrumentId: instrument.id,
    },
    include: {
      responses: true,
      result: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const activeSession =
    existing ??
    (await prisma.instrumentSession.create({
      data: {
        patientId,
        instrumentId: instrument.id,
      },
      include: {
        responses: true,
        result: true,
      },
    }))

  return (
    <InstrumentRunner
      sessionId={activeSession.id}
      instrumentName={instrument.name}
      instrumentDescription={instrument.description}
      items={runnerItems}
      initialResponses={activeSession.responses.map((r) => ({ itemId: r.itemId, value: r.value }))}
      isSubmitted={activeSession.status === "SUBMITTED"}
      lastSavedAt={activeSession.updatedAt}
      submittedAt={activeSession.submittedAt}
      onSave={async (itemId, value) => {
        "use server"
        return await saveInstrumentResponse({ sessionId: activeSession.id, itemId, value })
      }}
      onSubmit={async () => {
        "use server"
        return await submitInstrumentSession({ sessionId: activeSession.id })
      }}
    />
  )
}
