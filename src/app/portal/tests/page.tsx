import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate, formatDateTime } from "@/lib/utils"
import { requirePatientSession } from "@/lib/rbac"
import { Progress } from "@/components/ui/progress"
import { EmptyState } from "@/components/ui/EmptyState"
import { getServerLocale, getT } from "@/lib/i18n-server"
import { Prisma } from "@prisma/client"

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

export default async function PortalTestsPage() {
  const { patientId } = await requirePatientSession()
  const locale = await getServerLocale()
  const t = await getT(locale)

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, dateOfBirth: true },
  })

  if (!patient) {
    return (
      <EmptyState
        title={t("portal.messages.missingPatientTitle")}
        description={t("portal.messages.missingPatientDescription")}
        actionLabel={t("portal.buttons.back")}
        actionHref="/portal"
      />
    )
  }

  const ageYears = getAgeYears(patient.dateOfBirth)

  const assignments = await prisma.instrumentAssignment.findMany({
    where: { patientId },
    include: { instrument: true },
    orderBy: { createdAt: "desc" },
  })
  type AssignmentWithInstrument = (typeof assignments)[number]

  const instrumentSelect = Prisma.validator<Prisma.InstrumentSelect>()({
    id: true,
    name: true,
    description: true,
    slug: true,
    minAgeYears: true,
    maxAgeYears: true,
    status: true,
  })

  // Get instruments in user's locale, then merge with English as fallback
  const localeInstruments = await prisma.instrument.findMany({
    where: { 
      status: "ACTIVE",
      locale,
    },
    select: instrumentSelect,
  })

  const englishInstruments = await prisma.instrument.findMany({
    where: { 
      status: "ACTIVE",
      locale: "en",
    },
    select: instrumentSelect,
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
  type InstrumentWithAge = (typeof instruments)[number]

  const ageFilteredInstruments = instruments.filter((instrument: InstrumentWithAge) =>
    isInstrumentInAgeRange(ageYears, {
      minAgeYears: instrument.minAgeYears,
      maxAgeYears: instrument.maxAgeYears,
    })
  )

  const assignedInstrumentIds = new Set(assignments.map((a) => a.instrumentId))
  const availableInstruments = ageFilteredInstruments.filter((i) => !assignedInstrumentIds.has(i.id))

  const sessions = await prisma.instrumentSession.findMany({
    where: { patientId },
    include: {
      instrument: {
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
      result: true,
      _count: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const latestSessionByInstrumentId = new Map<string, (typeof sessions)[number]>()
  for (const s of sessions) {
    if (!latestSessionByInstrumentId.has(s.instrumentId)) {
      latestSessionByInstrumentId.set(s.instrumentId, s)
    }
  }

  const sortedAssignments = [...assignments].sort((a: AssignmentWithInstrument, b: AssignmentWithInstrument) => {
    const aDue = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY
    const bDue = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY
    if (aDue !== bDue) return aDue - bDue

    const aSession = latestSessionByInstrumentId.get(a.instrumentId)
    const bSession = latestSessionByInstrumentId.get(b.instrumentId)
    const aUpdated = aSession?.updatedAt?.getTime() ?? 0
    const bUpdated = bSession?.updatedAt?.getTime() ?? 0
    if (aUpdated !== bUpdated) return bUpdated - aUpdated

    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("portal.testsPage.title")}</h1>
        <p className="text-muted-foreground">{t("portal.testsPage.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("portal.assignedTests")}</CardTitle>
          <CardDescription>{t("portal.assignedDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("portal.noAssignedTests")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedAssignments.map((a) => {
                const latest = latestSessionByInstrumentId.get(a.instrumentId)
                const answeredCount = latest?._count?.responses ?? 0
                const totalCount = latest?.instrument?._count?.items
                const progressText = totalCount ? `${answeredCount}/${totalCount}` : `${answeredCount}`
                const progressPercentage = totalCount ? (answeredCount / totalCount) * 100 : 0
                const isSubmitted = a.status === "SUBMITTED"

                return (
                  <Card key={a.id}>
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-lg">{a.instrument.name}</CardTitle>
                      <CardDescription>{a.instrument.description}</CardDescription>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{t(`status.assignment.${a.status}`)}</Badge>
                        {a.dueDate ? (
                          <Badge variant="outline">
                            {t("portal.badges.due")} {formatDate(a.dueDate)}
                          </Badge>
                        ) : null}
                        {!isSubmitted ? (
                          <Badge variant="outline">
                            {t("portal.badges.progress")} {progressText}
                          </Badge>
                        ) : null}
                        {!isSubmitted && latest?.updatedAt ? (
                          <Badge variant="outline">
                            {t("portal.badges.saved")} {formatDateTime(latest.updatedAt)}
                          </Badge>
                        ) : null}
                        {isSubmitted && latest?.submittedAt ? (
                          <Badge variant="outline">
                            {t("portal.badges.submitted")} {formatDateTime(latest.submittedAt)}
                          </Badge>
                        ) : null}
                      </div>

                      {!isSubmitted && totalCount ? (
                        <Progress value={progressPercentage} className="h-1.5 mt-2" />
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isSubmitted ? (
                        <p className="text-sm text-muted-foreground">
                          {t("portal.results.score")}: {latest?.result?.totalScore ?? "--"} — {latest?.result?.interpretation ?? t("common.notAvailable")}
                        </p>
                      ) : null}

                      <Button asChild>
                        <Link href={`/portal/tests/${a.instrument.slug}`}>
                          {isSubmitted ? t("portal.buttons.view") : t("portal.buttons.startContinue")}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("portal.availableTests")}</CardTitle>
          <CardDescription>
            {t("portal.availableDescription")} ({t("portal.ageLabel")}: {ageYears})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableInstruments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("portal.noAvailable")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableInstruments.map((inst) => (
                <Card key={inst.id}>
                  <CardHeader>
                    <CardTitle>{inst.name}</CardTitle>
                    <CardDescription>{inst.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline">
                      <Link href={`/portal/tests/${inst.slug}`}>{t("portal.buttons.start")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link href="/portal">{t("portal.buttons.back")}</Link>
        </Button>
      </div>
    </div>
  )
}
