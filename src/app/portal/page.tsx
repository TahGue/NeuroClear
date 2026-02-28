import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate, formatDateTime, formatPlatform } from "@/lib/utils"
import { requirePatientSession } from "@/lib/rbac"
import { PortalLogoutButton } from "@/components/auth/PortalLogoutButton"

export const dynamic = "force-dynamic"

export default async function PortalPage() {
  const { patientId } = await requirePatientSession()

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      instrumentAssignments: {
        include: { instrument: true },
        orderBy: { createdAt: "desc" },
      },
      instrumentSessions: {
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
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      evaluations: {
        orderBy: { createdAt: "desc" },
        include: {
          assessment: true,
          report: true,
        },
      },
    },
  })

  if (!patient) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">We couldn&apos;t find your patient record.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeAssignments = patient.instrumentAssignments.filter((a) => a.status !== "SUBMITTED")
  const completedAssignments = patient.instrumentAssignments.filter((a) => a.status === "SUBMITTED")

  const latestSessionByInstrumentId = new Map<string, (typeof patient.instrumentSessions)[number]>()
  for (const s of patient.instrumentSessions) {
    if (!latestSessionByInstrumentId.has(s.instrumentId)) {
      latestSessionByInstrumentId.set(s.instrumentId, s)
    }
  }

  const sortedActiveAssignments = [...activeAssignments].sort((a, b) => {
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

  const sortedCompletedAssignments = [...completedAssignments].sort((a, b) => {
    const aSession = latestSessionByInstrumentId.get(a.instrumentId)
    const bSession = latestSessionByInstrumentId.get(b.instrumentId)
    const aSubmitted = aSession?.submittedAt?.getTime() ?? 0
    const bSubmitted = bSession?.submittedAt?.getTime() ?? 0
    if (aSubmitted !== bSubmitted) return bSubmitted - aSubmitted
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const continueAssignment = [...activeAssignments].sort((a, b) => {
    const aSession = latestSessionByInstrumentId.get(a.instrumentId)
    const bSession = latestSessionByInstrumentId.get(b.instrumentId)
    const aTime = aSession?.updatedAt?.getTime() ?? 0
    const bTime = bSession?.updatedAt?.getTime() ?? 0
    return bTime - aTime
  })[0]
  const continueHref = continueAssignment
    ? `/portal/tests/${continueAssignment.instrument.slug}`
    : "/portal/tests"

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {patient.firstName}</h1>
        <p className="text-muted-foreground">Your tests, evaluations, and reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">My Tests</CardTitle>
            <p className="text-sm text-muted-foreground">Assigned and available screeners</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/portal/tests">View tests</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={continueHref}>Continue</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Assigned / In progress</p>
              {activeAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assigned tests right now.</p>
              ) : (
                <div className="space-y-2">
                  {sortedActiveAssignments.slice(0, 5).map((a) => {
                    const latest = latestSessionByInstrumentId.get(a.instrumentId)
                    const answeredCount = latest?._count?.responses ?? 0
                    const totalCount = latest?.instrument?._count?.items
                    const progressText = totalCount ? `${answeredCount}/${totalCount}` : `${answeredCount}`
                    return (
                      <div key={a.id} className="flex items-center justify-between border-b py-2">
                        <div className="space-y-1">
                          <p className="font-medium">{a.instrument.name}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary">{a.status.replace("_", " ")}</Badge>
                            {a.dueDate ? (
                              <Badge variant="outline">Due {formatDate(a.dueDate)}</Badge>
                            ) : null}
                            {latest?.status ? (
                              <Badge variant="outline">{latest.status.replace("_", " ")}</Badge>
                            ) : null}
                            <Badge variant="outline">Progress {progressText}</Badge>
                            {latest?.updatedAt ? (
                              <Badge variant="outline">Saved {formatDateTime(latest.updatedAt)}</Badge>
                            ) : null}
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/portal/tests/${a.instrument.slug}`}>Start / Continue</Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Completed</p>
              {completedAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed tests yet.</p>
              ) : (
                <div className="space-y-2">
                  {sortedCompletedAssignments.slice(0, 5).map((a) => {
                    const latest = latestSessionByInstrumentId.get(a.instrumentId)
                    return (
                      <div key={a.id} className="flex items-center justify-between border-b py-2">
                        <div className="space-y-1">
                          <p className="font-medium">{a.instrument.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {latest?.result?.totalScore ?? "--"} — {latest?.result?.interpretation ?? "--"}
                          </p>
                          {latest?.submittedAt ? (
                            <p className="text-xs text-muted-foreground">Submitted {formatDateTime(latest.submittedAt)}</p>
                          ) : null}
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/portal/tests/${a.instrument.slug}`}>View</Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">Evaluations & Reports</CardTitle>
            <p className="text-sm text-muted-foreground">Your clinician-administered assessments</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {patient.evaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No evaluations yet.</p>
            ) : (
              patient.evaluations.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between border-b py-2">
                  <div className="space-y-1">
                    <p className="font-medium">{ev.assessment.name}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{formatPlatform(ev.assessment.platform)}</Badge>
                      <Badge variant="secondary">{ev.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ev.administeredDate ? formatDate(ev.administeredDate) : "Date not set"}
                    </p>
                  </div>
                  {ev.report ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/reports?id=${ev.report.id}`}>View report</Link>
                    </Button>
                  ) : (
                    <Badge variant="outline">No report</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
