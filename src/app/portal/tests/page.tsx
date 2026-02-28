import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate, formatDateTime } from "@/lib/utils"
import { requirePatientSession } from "@/lib/rbac"

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

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, dateOfBirth: true },
  })

  if (!patient) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient not found</CardTitle>
            <CardDescription>We couldn&apos;t find your patient record.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const ageYears = getAgeYears(patient.dateOfBirth)

  const assignments = await prisma.instrumentAssignment.findMany({
    where: { patientId },
    include: { instrument: true },
    orderBy: { createdAt: "desc" },
  })

  const instruments = await prisma.instrument.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  })

  const ageFilteredInstruments = instruments.filter((i) =>
    isInstrumentInAgeRange(ageYears, { minAgeYears: i.minAgeYears, maxAgeYears: i.maxAgeYears })
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

  const sortedAssignments = [...assignments].sort((a, b) => {
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
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tests</h1>
        <p className="text-muted-foreground">Take assigned screeners and view results</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Tests</CardTitle>
          <CardDescription>Tests assigned to you by your clinician</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assigned tests yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedAssignments.map((a) => {
                const latest = latestSessionByInstrumentId.get(a.instrumentId)
                const answeredCount = latest?._count?.responses ?? 0
                const totalCount = latest?.instrument?._count?.items
                const progressText = totalCount ? `${answeredCount}/${totalCount}` : `${answeredCount}`
                const isSubmitted = a.status === "SUBMITTED"

                return (
                  <Card key={a.id}>
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-lg">{a.instrument.name}</CardTitle>
                      <CardDescription>{a.instrument.description}</CardDescription>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{a.status.replace("_", " ")}</Badge>
                        {a.dueDate ? <Badge variant="outline">Due {formatDate(a.dueDate)}</Badge> : null}
                        <Badge variant="outline">Progress {progressText}</Badge>
                        {!isSubmitted && latest?.updatedAt ? (
                          <Badge variant="outline">Saved {formatDateTime(latest.updatedAt)}</Badge>
                        ) : null}
                        {isSubmitted && latest?.submittedAt ? (
                          <Badge variant="outline">Submitted {formatDateTime(latest.submittedAt)}</Badge>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isSubmitted ? (
                        <p className="text-sm text-muted-foreground">
                          Score: {latest?.result?.totalScore ?? "--"} — {latest?.result?.interpretation ?? "--"}
                        </p>
                      ) : null}

                      <Button asChild>
                        <Link href={`/portal/tests/${a.instrument.slug}`}>{isSubmitted ? "View" : "Start / Continue"}</Link>
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
          <CardTitle>Available Tests</CardTitle>
          <CardDescription>Additional tests available for your age group (Age: {ageYears})</CardDescription>
        </CardHeader>
        <CardContent>
          {availableInstruments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional tests available.</p>
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
                      <Link href={`/portal/tests/${inst.slug}`}>Start</Link>
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
          <Link href="/portal">Back to portal</Link>
        </Button>
      </div>
    </div>
  )
}
