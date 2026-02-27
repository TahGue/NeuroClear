import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate, formatPlatform } from "@/lib/utils"
import { requirePatientSession } from "@/lib/rbac"

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
        include: { instrument: true, result: true },
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

  const latestSessionByInstrumentId = new Map(
    patient.instrumentSessions.map((s) => [s.instrumentId, s])
  )

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
                <Link href="/portal/tests">Continue</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Assigned / In progress</p>
              {activeAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assigned tests right now.</p>
              ) : (
                <div className="space-y-2">
                  {activeAssignments.slice(0, 5).map((a) => {
                    const latest = latestSessionByInstrumentId.get(a.instrumentId)
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
                  {completedAssignments.slice(0, 5).map((a) => {
                    const latest = latestSessionByInstrumentId.get(a.instrumentId)
                    return (
                      <div key={a.id} className="flex items-center justify-between border-b py-2">
                        <div className="space-y-1">
                          <p className="font-medium">{a.instrument.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {latest?.result?.totalScore ?? "--"} — {latest?.result?.interpretation ?? "--"}
                          </p>
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
