import { prisma } from "@/lib/prisma"
import { TestsClient } from "./tests-client"
import { getServerLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function AdminTestsPage() {
  const locale = await getServerLocale()

  // Get instruments in user's locale first
  const localeInstruments = await prisma.instrument.findMany({
    where: { locale },
    orderBy: [{ name: "asc" }],
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

  // Get English instruments as fallback
  const englishInstruments = await prisma.instrument.findMany({
    where: { locale: "en" },
    orderBy: [{ name: "asc" }],
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

  // Merge: prefer user's locale, fallback to English for missing slugs
  const instrumentsBySlug = new Map<string, typeof englishInstruments[number]>()
  for (const inst of englishInstruments) {
    instrumentsBySlug.set(inst.slug, inst)
  }
  for (const inst of localeInstruments) {
    instrumentsBySlug.set(inst.slug, inst) // Overwrite with localized version
  }
  const instruments = Array.from(instrumentsBySlug.values())

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
