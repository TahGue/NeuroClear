import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { InstrumentRunner } from "@/components/instruments/InstrumentRunner"
import { saveInstrumentResponse, submitInstrumentSession } from "./actions"
import { z } from "zod"

export const dynamic = "force-dynamic"

type ItemOption = { label: string; value: number }
type Item = { id: string; order: number; prompt: string; options: ItemOption[] }

const ItemOptionSchema = z.object({
  label: z.string(),
  value: z.number(),
})

const ItemOptionsSchema = z.array(ItemOptionSchema)

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const assignment = await prisma.instrumentAssignment.findUnique({
    where: { token },
    include: {
      instrument: {
        include: {
          items: { orderBy: { order: "asc" } },
        },
      },
      patient: true,
    },
  })

  if (!assignment) {
    notFound()
  }

  if (assignment.status === "SUBMITTED") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Thank you</h1>
          <p className="text-muted-foreground">
            This questionnaire for {assignment.patient.firstName} {assignment.patient.lastName} has already been completed and submitted.
          </p>
        </div>
      </div>
    )
  }

  const existing = await prisma.instrumentSession.findFirst({
    where: {
      patientId: assignment.patientId,
      instrumentId: assignment.instrumentId,
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
        patientId: assignment.patientId,
        instrumentId: assignment.instrumentId,
      },
      include: {
        responses: true,
        result: true,
      },
    }))

  const runnerItems: Item[] = assignment.instrument.items.map((it) => {
    const parsedOptions = ItemOptionsSchema.safeParse(it.options)
    return {
      id: it.id,
      order: it.order,
      prompt: it.prompt,
      options: parsedOptions.success ? parsedOptions.data : [],
    }
  })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Questionnaire for {assignment.patient.firstName} {assignment.patient.lastName}
        </h2>
        <p className="text-xs text-muted-foreground">
          Please complete the following form regarding the patient.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <InstrumentRunner
          sessionId={activeSession.id}
          instrumentName={assignment.instrument.name}
          instrumentDescription={assignment.instrument.description}
          items={runnerItems}
          initialResponses={activeSession.responses.map((r) => ({ itemId: r.itemId, value: r.value }))}
          isSubmitted={activeSession.status === "SUBMITTED"}
          lastSavedAt={activeSession.updatedAt}
          submittedAt={activeSession.submittedAt}
          backLink={`/invite/${token}`}
          onSave={async (itemId, value) => {
            "use server"
            return await saveInstrumentResponse({ token, sessionId: activeSession.id, itemId, value })
          }}
          onSubmit={async () => {
            "use server"
            return await submitInstrumentSession({ token, sessionId: activeSession.id })
          }}
        />
      </div>
    </div>
  )
}
