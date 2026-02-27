import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PortalTestsPage() {
  const session = await getServerSession(authOptions)
  const patientId = (session?.user as any)?.patientId as string | undefined

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

  const instruments = await prisma.instrument.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  })

  const sessions = await prisma.instrumentSession.findMany({
    where: { patientId },
    include: { instrument: true, result: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tests</h1>
        <p className="text-muted-foreground">Take available screeners and view results</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {instruments.map((inst) => (
          <Card key={inst.id}>
            <CardHeader>
              <CardTitle>{inst.name}</CardTitle>
              <CardDescription>{inst.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/portal/tests/${inst.slug}`}>Start / Continue</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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
