"use client"

import { useState } from "react"
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
  const [unassignErrorByAssignmentId, setUnassignErrorByAssignmentId] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const reports = patient.evaluations.filter(e => e.report !== null).map(e => ({
    ...e.report!,
    assessmentName: e.assessment.name
  }))

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
    const currentStatus = isSubmitted ? "SUBMITTED" : "ASSIGNED"
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
            Back to Patients
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground">Patient ID: {patient.id.substring(0, 8)}...</p>
        </div>
        <Badge variant={patient.status === "ACTIVE" ? "default" : "secondary"}>
          {patient.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Patient Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p>{formatDate(patient.dateOfBirth)} ({formatAge(patient.dateOfBirth)} years)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Referral Source</p>
              <p>{patient.referralSource || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p>{patient.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Added On</p>
              <p>{formatDate(patient.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Portal Tests</CardTitle>
                <CardDescription>Assigned patient-facing screeners</CardDescription>
              </div>
              <AssignInstrumentModal patientId={patient.id} instruments={instruments} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.instrumentAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No portal tests assigned.
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
              <CardTitle>Evaluation History</CardTitle>
              <CardDescription>Assessment history and current test batteries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evaluation ID</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Administered By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.evaluations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No evaluations found for this patient.
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
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Completed assessment reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No reports generated yet.
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

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for this patient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href={`/score-entry?patient=${patient.id}`}>
                Start New Evaluation
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/reports?patient=${patient.id}`}>
                View All Reports
              </Link>
            </Button>
            <Button variant="outline">
              Edit Patient Info
            </Button>
            <Button variant="destructive" className="ml-auto" onClick={async () => {
              if (confirm("Are you sure you want to delete this patient and all their data? This action cannot be undone.")) {
                const res = await fetch(`/api/patients/${patient.id}`, { method: 'DELETE' })
                if (res.ok) {
                  window.location.href = '/patients'
                } else {
                  alert("Failed to delete patient.")
                }
              }
            }}>
              Delete Patient
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
