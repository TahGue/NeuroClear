import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate, formatPlatform } from "@/lib/utils"

export default async function PortalPage() {
  const session = await getServerSession(authOptions)

  const patientId = (session?.user as any)?.patientId as string | undefined
  if (!patientId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Your account is not linked to a patient record.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
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
            <p className="text-sm text-muted-foreground">We couldn't find your patient record.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {patient.firstName}</h1>
        <p className="text-muted-foreground">Your evaluations and reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {patient.evaluations.map((ev) => (
          <Card key={ev.id}>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">{ev.assessment.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{formatPlatform(ev.assessment.platform)}</Badge>
                <Badge variant="secondary">{ev.status.replace("_", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Date:</span> {ev.administeredDate ? formatDate(ev.administeredDate) : "Not set"}
              </p>
              <p>
                <span className="text-muted-foreground">Clinician:</span> {ev.administeredBy || "Not set"}
              </p>
              {ev.report ? (
                <Link className="text-primary underline" href={`/reports?id=${ev.report.id}`}>
                  View report
                </Link>
              ) : (
                <p className="text-muted-foreground">Report not generated yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
