import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
  const session = await getServerSession(authOptions)
  const patientId = session?.user?.patientId ?? undefined

  if (!patientId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access error</CardTitle>
            <CardDescription>Your account is not linked to a patient record.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

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

  const ageFilteredInstruments = instruments.filter((i) => isInstrumentInAgeRange(ageYears, i))

  const assignedInstrumentIds = new Set(assignments.map((a) => a.instrumentId))
  const availableInstruments = ageFilteredInstruments.filter((i) => !assignedInstrumentIds.has(i.id))

  const sessions = await prisma.instrumentSession.findMany({
    where: { patientId },
    include: { instrument: true, result: true },
    orderBy: { createdAt: "desc" },
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
              {assignments.map((a) => (
                <Card key={a.id}>
                  <CardHeader>
                    <CardTitle>{a.instrument.name}</CardTitle>
                    <CardDescription>{a.instrument.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href={`/portal/tests/${a.instrument.slug}`}>Start / Continue</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
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

      <Card>
        <CardHeader>
          <CardTitle>Previous Results</CardTitle>
          <CardDescription>Your submitted sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            sessions
              .filter((s) => s.status === "SUBMITTED")
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <p className="font-medium">{s.instrument.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {s.result?.totalScore ?? "--"} — {s.result?.interpretation ?? "--"}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/portal/tests/${s.instrument.slug}`}>View</Link>
                  </Button>
                </div>
              ))
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
