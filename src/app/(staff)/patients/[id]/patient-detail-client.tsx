"use client"

import { useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, User, FileText } from "lucide-react"
import Link from "next/link"
import { formatDate, formatAge, formatPlatform } from "@/lib/utils"
import {
  Assessment,
  Evaluation,
  InstrumentAudience,
  InstrumentSessionStatus,
  InstrumentAssignmentStatus,
  Patient,
  Report,
} from "@prisma/client"
import { AssignInstrumentModal } from "@/components/instruments/AssignInstrumentModal"
import { Copy, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScoreTrendChart } from "@/components/dashboard/charts"
import { toast } from "sonner"

type EvaluationWithDetails = Evaluation & {
  assessment: Assessment
  report: Report | null
}

type InstrumentAssignmentWithInstrument = {
  id: string
  instrumentId: string
  status: InstrumentAssignmentStatus
  dueDate: Date | null
  createdAt: Date
  token: string | null
  instrument: {
    id: string
    name: string
    description: string | null
    audience: InstrumentAudience
  }
}

type InstrumentSessionWithDetails = {
  id: string
  instrumentId: string
  status: InstrumentSessionStatus
  createdAt: Date
  result: { totalScore: number; interpretation: string } | null
}

type PatientData = Patient & {
  evaluations: EvaluationWithDetails[]
  instrumentAssignments: InstrumentAssignmentWithInstrument[]
  instrumentSessions: InstrumentSessionWithDetails[]
}

type InstrumentOption = {
  id: string
  name: string
  description: string | null
}

export function PatientDetailClient({
  patient,
  instruments,
  currentUserRole,
}: {
  patient: PatientData
  instruments: InstrumentOption[]
  currentUserRole: string
}) {
  const { t } = useI18n()
  const [unassignErrorByAssignmentId, setUnassignErrorByAssignmentId] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const reports = patient.evaluations.filter(e => e.report !== null).map(e => ({
    ...e.report!,
    assessmentName: e.assessment.name
  }))

  const trendData = useMemo(() => {
    const submittedSessions = patient.instrumentSessions
      .filter(s => s.status === "SUBMITTED" && s.result?.totalScore !== undefined)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(s => ({
        date: formatDate(s.createdAt),
        score: s.result!.totalScore,
      }))
    return submittedSessions
  }, [patient.instrumentSessions])

  const latestSessionByInstrumentId = new Map<string, PatientData["instrumentSessions"][number]>()
  for (const s of patient.instrumentSessions) {
    if (!latestSessionByInstrumentId.has(s.instrumentId)) {
      latestSessionByInstrumentId.set(s.instrumentId, s)
    }
  }

  const filteredAssignments = patient.instrumentAssignments.filter(a => {
    if (statusFilter === "ALL") return true
    
    const latest = latestSessionByInstrumentId.get(a.instrumentId)
    const isSubmitted = latest?.status === "SUBMITTED"
    
    // Check if expired
    const isExpired = a.dueDate && new Date(a.dueDate).getTime() < Date.now() && !isSubmitted
    
    let currentStatus = isSubmitted ? "SUBMITTED" : "ASSIGNED"
    if (isExpired && !isSubmitted) {
      currentStatus = "EXPIRED"
    }

    return currentStatus === statusFilter
  }).sort((a, b) => {
    const aDue = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY
    const bDue = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY
    if (aDue !== bDue) return aDue - bDue
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground">{t("patients.tableHeaders.id")}: {patient.id.substring(0, 8)}...</p>
        </div>
        <Badge variant={patient.status === "ACTIVE" ? "default" : "secondary"}>
          {t(`patients.status.${patient.status}`)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t("patients.detail.personalInfo")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("patients.detail.dateOfBirth")}</p>
              <p>{formatDate(patient.dateOfBirth)} ({formatAge(patient.dateOfBirth)} {t("patients.table.ageSuffix")})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("patients.tableHeaders.referral")}</p>
              <p>{patient.referralSource || t("common.notAvailable")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("patients.tableHeaders.status")}</p>
              <p>{t(`patients.status.${patient.status}`)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("patients.detail.personalInfo")}</p>
              <p>{formatDate(patient.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("portal.home.testsCard.title")}</CardTitle>
                <CardDescription>{t("portal.home.testsCard.description")}</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <AssignInstrumentModal patientId={patient.id} instruments={instruments} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboard.recent.columns.assessment")}</TableHead>
                    <TableHead>{t("portal.results.title")}</TableHead>
                    <TableHead>{t("portal.badges.due")}</TableHead>
                    <TableHead>{t("dashboard.recent.columns.status")}</TableHead>
                    <TableHead>{t("portal.results.score")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.instrumentAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {t("portal.home.testsCard.noAssigned")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssignments.map((a) => {
                      const latest = latestSessionByInstrumentId.get(a.instrumentId)
                      const isSubmitted = latest?.status === "SUBMITTED"
                      
                      let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline"
                      if (latest?.result?.interpretation) {
                        const interp = latest.result.interpretation.toLowerCase()
                        if (interp.includes("severe") || interp.includes("high") || interp.includes("review")) {
                          badgeVariant = "destructive"
                        } else if (interp.includes("mild") || interp.includes("moderate") || interp.includes("developing") || interp.includes("needs")) {
                          badgeVariant = "secondary"
                        } else {
                          badgeVariant = "default"
                        }
                      }

                      const unassign = async () => {
                        setUnassignErrorByAssignmentId((prev) => {
                          const next = { ...prev }
                          delete next[a.id]
                          return next
                        })

                        const res = await fetch("/api/instrument-assignments", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            patientId: patient.id,
                            instrumentId: a.instrumentId,
                          }),
                        })

                        if (!res.ok) {
                          setUnassignErrorByAssignmentId((prev) => ({
                            ...prev,
                            [a.id]: "Failed to unassign test.",
                          }))
                          return
                        }

                        window.location.reload()
                      }

                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.instrument.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{a.instrument.audience}</Badge>
                          </TableCell>
                          <TableCell>{a.dueDate ? formatDate(a.dueDate) : "—"}</TableCell>
                          <TableCell>
                            <Badge variant={isSubmitted ? "default" : "secondary"}>
                              {isSubmitted ? "SUBMITTED" : "ASSIGNED"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {latest?.result ? (
                                <span className="text-sm">
                                  {latest.result.totalScore} — {latest.result.interpretation}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}

                              <div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={unassign}
                                  disabled={isSubmitted}
                                >
                                  Unassign
                                </Button>
                              </div>

                              {unassignErrorByAssignmentId[a.id] ? (
                                <p className="text-xs text-destructive">{unassignErrorByAssignmentId[a.id]}</p>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("portal.home.evaluationsCard.title")}</CardTitle>
              <CardDescription>{t("portal.home.evaluationsCard.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboard.recent.columns.id")}</TableHead>
                    <TableHead>{t("dashboard.recent.columns.assessment")}</TableHead>
                    <TableHead>{t("dashboard.recent.columns.platform")}</TableHead>
                    <TableHead>{t("scoreEntry.adminBy")}</TableHead>
                    <TableHead>{t("dashboard.recent.columns.date")}</TableHead>
                    <TableHead>{t("dashboard.recent.columns.status")}</TableHead>
                    <TableHead>{t("patients.tableHeaders.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.evaluations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {t("portal.home.evaluationsCard.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    patient.evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-medium">{evaluation.id.substring(0, 8)}...</TableCell>
                        <TableCell>{evaluation.assessment.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatPlatform(evaluation.assessment.platform)}</Badge>
                        </TableCell>
                        <TableCell>{evaluation.administeredBy || 'N/A'}</TableCell>
                        <TableCell>{evaluation.administeredDate ? formatDate(evaluation.administeredDate) : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              evaluation.status === "COMPLETED" ? "default" :
                              evaluation.status === "IN_PROGRESS" ? "secondary" :
                              "outline"
                            }
                          >
                            {evaluation.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/score-entry?evaluation=${evaluation.id}`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("reports.title")}</CardTitle>
              <CardDescription>{t("reports.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboard.recent.columns.id")}</TableHead>
                    <TableHead>{t("dashboard.recent.columns.assessment")}</TableHead>
                    <TableHead>{t("patients.tableHeaders.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        {t("reports.list.empty.title")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id.substring(0, 8)}...</TableCell>
                        <TableCell>{report.assessmentName}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/reports?id=${report.id}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t("patients.quickActions.title")}</CardTitle>
          <CardDescription>{t("patients.quickActions.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href={`/score-entry?patient=${patient.id}`}>
                {t("patients.quickActions.startNewEvaluation")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/reports">{t("patients.quickActions.viewAllReports")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {trendData.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t("dashboard.charts.domainTitle")}</CardTitle>
            <CardDescription>{t("dashboard.charts.domainDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={trendData} />
          </CardContent>
        </Card>
      )}

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t("patients.quickActions.title")}</CardTitle>
          <CardDescription>{t("patients.quickActions.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              {t("patients.quickActions.editPatientInfo")}
            </Button>
            <Button variant="destructive" className="ml-auto" onClick={async () => {
              if (confirm(t("patients.quickActions.deletePatient"))) {
                const res = await fetch(`/api/patients/${patient.id}`, { method: 'DELETE' })
                if (res.ok) {
                  window.location.href = '/patients'
                } else {
                  toast.error(t("common.error"))
                }
              }
            }}>
              {t("common.delete")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
