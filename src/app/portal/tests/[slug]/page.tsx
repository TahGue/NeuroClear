import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { InstrumentRunner } from "@/components/instruments/InstrumentRunner"
import { redirect } from "next/navigation"

export default async function InstrumentRunPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const session = await getServerSession(authOptions)
  const patientId = (session?.user as any)?.patientId as string | undefined
  if (!patientId) redirect("/portal")

  const instrument = await prisma.instrument.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { order: "asc" } },
    },
  })

  if (!instrument) redirect("/portal/tests")

  const existing = await prisma.instrumentSession.findFirst({
    where: {
      patientId,
      instrumentId: instrument.id,
      status: "IN_PROGRESS",
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
    <div className="min-h-screen bg-background p-6">
      <InstrumentRunner
        sessionId={activeSession.id}
        instrumentName={instrument.name}
        instrumentDescription={instrument.description}
        items={instrument.items as any}
        initialResponses={activeSession.responses.map((r) => ({ itemId: r.itemId, value: r.value }))}
        isSubmitted={activeSession.status === "SUBMITTED"}
      />
    </div>
  )
}
