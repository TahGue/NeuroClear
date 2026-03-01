import { prisma } from "@/lib/prisma"
import { TestsClient } from "./tests-client"
import { getServerLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function AdminTestsPage() {
  const locale = await getServerLocale()

  // Get all unique instruments (by slug) with English as base
  const instruments = await prisma.instrument.findMany({
    where: { locale: "en" },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          items: true,
          assignments: true,
          sessions: true,
        },
      },
    },
  })

  // Serialize for client component
  const serializedInstruments = instruments.map(instrument => ({
    id: instrument.id,
    slug: instrument.slug,
    name: instrument.name,
    description: instrument.description,
    status: instrument.status,
    category: instrument.category,
    audience: instrument.audience,
    minAgeYears: instrument.minAgeYears,
    maxAgeYears: instrument.maxAgeYears,
    _count: {
      items: instrument._count.items,
      assignments: instrument._count.assignments,
      sessions: instrument._count.sessions,
    },
  }))

  return <TestsClient initialInstruments={serializedInstruments} />
}
