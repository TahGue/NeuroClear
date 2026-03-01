import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate, formatDateTime, formatPlatform } from "@/lib/utils"
import { requirePatientSession } from "@/lib/rbac"
import { EmptyState } from "@/components/ui/EmptyState"
import { getServerLocale, getT } from "@/lib/i18n-server"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

export default async function PortalPage() {
  const { patientId } = await requirePatientSession()
  const locale = await getServerLocale()
  const t = await getT(locale)

  const portalPatientQuery = Prisma.validator<Prisma.PatientFindUniqueArgs>()({
    where: { id: patientId },
    include: {
      instrumentAssignments: {
        include: { instrument: true },
      },
      instrumentSessions: {
        include: {
          instrument: {
            include: {
              _count: { select: { items: true } },
            },
          },
          result: true,
          _count: { select: { responses: true } },
        },
      },
      evaluations: {
        include: {
          assessment: true,
          report: true,
        },
      },
    },
  })

  type PatientWithPortalData = Prisma.PatientGetPayload<typeof portalPatientQuery>

  const patient = await prisma.patient.findUnique(portalPatientQuery)

  if (!patient) {
    return (
      <EmptyState
        title={t("portal.messages.missingPatientTitle")}
        description={t("portal.messages.missingPatientDescription")}
        actionLabel={t("navigation.logout")}
        actionHref="/api/auth/signout"
      />
    )
  }

  type AssignmentWithInstrument = PatientWithPortalData["instrumentAssignments"][number]
  type SessionWithMeta = PatientWithPortalData["instrumentSessions"][number]
  type EvaluationWithRelations = PatientWithPortalData["evaluations"][number]

  const assignments = patient.instrumentAssignments as AssignmentWithInstrument[]
  const sessions = patient.instrumentSessions as SessionWithMeta[]
  const evaluations = patient.evaluations as EvaluationWithRelations[]

  const activeAssignments = assignments.filter((assignment) => assignment.status !== "SUBMITTED")
  const completedAssignments = assignments.filter((assignment) => assignment.status === "SUBMITTED")
  const latestSessionByInstrumentId = new Map<string, SessionWithMeta>()
  for (const s of sessions) {
    if (!latestSessionByInstrumentId.has(s.instrumentId)) {
      latestSessionByInstrumentId.set(s.instrumentId, s)
    }
  }

  const sortedActiveAssignments = [...activeAssignments].sort((a: AssignmentWithInstrument, b: AssignmentWithInstrument) => {
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

  const sortedCompletedAssignments = [...completedAssignments].sort((a: AssignmentWithInstrument, b: AssignmentWithInstrument) => {
    const aSession = latestSessionByInstrumentId.get(a.instrumentId)
    const bSession = latestSessionByInstrumentId.get(b.instrumentId)
    const aSubmitted = aSession?.submittedAt?.getTime() ?? 0
    const bSubmitted = bSession?.submittedAt?.getTime() ?? 0
    if (aSubmitted !== bSubmitted) return bSubmitted - aSubmitted
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const continueAssignment = [...activeAssignments].sort((a: AssignmentWithInstrument, b: AssignmentWithInstrument) => {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("portal.welcome")}, {patient.firstName}
        </h1>
        <p className="text-muted-foreground">{t("portal.home.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">{t("portal.home.testsCard.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("portal.home.testsCard.description")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/portal/tests">{t("portal.buttons.viewTests")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={continueHref}>{t("portal.buttons.startContinue")}</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t("portal.home.testsCard.assignedLabel")}</p>
              {activeAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("portal.home.testsCard.noAssigned")}</p>
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
                            <Badge variant="secondary">{t(`status.assignment.${a.status}`)}</Badge>
                            {a.dueDate ? (
                              <Badge variant="outline">
                                {t("portal.badges.due")} {formatDate(a.dueDate)}
                              </Badge>
                            ) : null}
                            {latest?.status ? (
                              <Badge variant="outline">{t(`status.assignment.${latest.status}`)}</Badge>
                            ) : null}
                            <Badge variant="outline">
                              {t("portal.badges.progress")} {progressText}
                            </Badge>
                            {latest?.updatedAt ? (
                              <Badge variant="outline">
                                {t("portal.badges.saved")} {formatDateTime(latest.updatedAt)}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/portal/tests/${a.instrument.slug}`}>
                            {t("portal.buttons.startContinue")}
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t("portal.home.testsCard.completedLabel")}</p>
              {completedAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("portal.home.testsCard.noCompleted")}</p>
              ) : (
                <div className="space-y-2">
                  {sortedCompletedAssignments.slice(0, 5).map((a) => {
                    const latest = latestSessionByInstrumentId.get(a.instrumentId)
                    return (
                      <div key={a.id} className="flex items-center justify-between border-b py-2">
                        <div className="space-y-1">
                          <p className="font-medium">{a.instrument.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("portal.results.score")}: {latest?.result?.totalScore ?? "--"} — {latest?.result?.interpretation ?? t("common.notAvailable")}
                          </p>
                          {latest?.submittedAt ? (
                            <p className="text-xs text-muted-foreground">
                              {t("portal.badges.submitted")} {formatDateTime(latest.submittedAt)}
                            </p>
                          ) : null}
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/portal/tests/${a.instrument.slug}`}>{t("portal.buttons.view")}</Link>
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
            <CardTitle className="text-lg">{t("portal.home.evaluationsCard.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("portal.home.evaluationsCard.description")}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {evaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("portal.home.evaluationsCard.empty")}</p>
            ) : (
              evaluations.slice(0, 5).map((ev: EvaluationWithRelations) => (
                <div key={ev.id} className="flex items-center justify-between border-b py-2">
                  <div className="space-y-1">
                    <p className="font-medium">{ev.assessment.name}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{formatPlatform(ev.assessment.platform)}</Badge>
                      <Badge variant="secondary">{t(`status.evaluation.${ev.status}`)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ev.administeredDate ? formatDate(ev.administeredDate) : t("portal.home.evaluationsCard.dateNotSet")}
                    </p>
                  </div>
                  {ev.report ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/reports?id=${ev.report.id}`}>{t("portal.home.evaluationsCard.viewReport")}</Link>
                    </Button>
                  ) : (
                    <Badge variant="outline">{t("common.notAvailable")}</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-dashed md:col-span-2">
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-sm font-medium">{t("portal.home.support.title")}</p>
            <p className="text-sm text-muted-foreground">{t("portal.home.support.description")}</p>
            <Button variant="link" asChild className="mt-2 h-auto p-0">
              <a href="mailto:support@example.com">{t("portal.home.support.contact")}</a>
            </Button>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">{t("portal.home.support.privacy")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
