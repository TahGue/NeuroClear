import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardCharts, DomainBarChart, AssignmentStatusChart, AgeDistributionChart, CompletionRateChart } from "@/components/dashboard/charts"
import { Activity, Users, FileText, Clock, ClipboardList } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPlatform } from "@/lib/utils"
import { getServerLocale, getT } from "@/lib/i18n-server"

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "#6b7280",
  IN_PROGRESS: "#3b82f6",
  SUBMITTED: "#10b981",
  EXPIRED: "#ef4444",
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function getAgeGroup(age: number): string {
  if (age < 13) return "Child (0-12)"
  if (age < 18) return "Adolescent (13-17)"
  if (age < 65) return "Adult (18-64)"
  return "Senior (65+)"
}

async function getDashboardData() {
  const activeEvaluations = await prisma.evaluation.count({
    where: { status: 'IN_PROGRESS' }
  })
  const completedReports = await prisma.report.count()
  const pendingReviews = await prisma.evaluation.count({
    where: { status: 'PENDING_REVIEW' }
  })
  const totalPatients = await prisma.patient.count()
  const totalAssignments = await prisma.instrumentAssignment.count()

  const recentEvaluations = await prisma.evaluation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: true,
      assessment: true,
    }
  })

  // Group by platform
  const evals = await prisma.evaluation.findMany({
    include: { assessment: true }
  })
  
  const platformCounts = evals.reduce((acc, curr) => {
    const platform = formatPlatform(curr.assessment.platform)
    acc[platform] = (acc[platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const platformData = Object.entries(platformCounts).map(([name, value]) => ({ name, value }))

  // Group by domain
  const domainCounts = evals.reduce((acc, curr) => {
    const domain = curr.assessment.domain.replace('_', ' ')
    acc[domain] = (acc[domain] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const domainData = Object.entries(domainCounts).map(([domain, count]) => ({ domain, count }))

  // Assignment status distribution
  const assignments = await prisma.instrumentAssignment.findMany({
    select: { status: true }
  })
  
  const assignmentStatusCounts = assignments.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const assignmentStatusData = Object.entries(assignmentStatusCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    color: STATUS_COLORS[name] || "#6b7280"
  }))

  // Age distribution
  const patients = await prisma.patient.findMany({
    select: { dateOfBirth: true }
  })

  const ageGroupCounts = patients.reduce((acc, patient) => {
    const age = calculateAge(patient.dateOfBirth)
    const group = getAgeGroup(age)
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const ageDistributionData = Object.entries(ageGroupCounts)
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => {
      const order = ["Child (0-12)", "Adolescent (13-17)", "Adult (18-64)", "Senior (65+)"]
      return order.indexOf(a.range) - order.indexOf(b.range)
    })

  // Completion rates by instrument
  const instruments = await prisma.instrument.findMany({
    select: {
      name: true,
      assignments: {
        select: { status: true }
      }
    }
  })

  const completionRateData = instruments
    .filter(i => i.assignments.length > 0)
    .map(instrument => {
      const completed = instrument.assignments.filter(a => a.status === 'SUBMITTED').length
      const pending = instrument.assignments.length - completed
      return {
        name: instrument.name.length > 15 ? instrument.name.substring(0, 15) + '...' : instrument.name,
        completed,
        pending
      }
    })
    .sort((a, b) => (b.completed + b.pending) - (a.completed + a.pending))
    .slice(0, 6)

  return {
    stats: { activeEvaluations, completedReports, pendingReviews, totalPatients, totalAssignments },
    recentEvaluations,
    platformData: platformData.length ? platformData : [
      { name: "Q-interactive", value: 45 },
      { name: "Q-global", value: 30 },
      { name: "MHS Online", value: 20 },
      { name: "ALTO", value: 5 },
    ],
    domainData: domainData.length ? domainData : [
      { domain: "Cognitive", count: 42 },
      { domain: "Adaptive", count: 28 },
      { domain: "Behavioral", count: 35 },
      { domain: "Executive Function", count: 31 },
    ],
    assignmentStatusData: assignmentStatusData.length ? assignmentStatusData : [
      { name: "Assigned", value: 12, color: "#6b7280" },
      { name: "In Progress", value: 8, color: "#3b82f6" },
      { name: "Submitted", value: 15, color: "#10b981" },
    ],
    ageDistributionData: ageDistributionData.length ? ageDistributionData : [
      { range: "Child (0-12)", count: 5 },
      { range: "Adolescent (13-17)", count: 8 },
      { range: "Adult (18-64)", count: 25 },
      { range: "Senior (65+)", count: 3 },
    ],
    completionRateData: completionRateData.length ? completionRateData : [
      { name: "PHQ-9", completed: 10, pending: 2 },
      { name: "GAD-7", completed: 8, pending: 3 },
      { name: "AUDIT", completed: 5, pending: 4 },
    ]
  }
}

export default async function Dashboard() {
  const locale = await getServerLocale()
  const t = await getT(locale)
  const { stats, recentEvaluations, platformData, domainData, assignmentStatusData, ageDistributionData, completionRateData } = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.description")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.cards.activeEvaluations.title")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvaluations}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.cards.activeEvaluations.description")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.cards.completedReports.title")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReports}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.cards.completedReports.description")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.cards.pendingReviews.title")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.cards.pendingReviews.description")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.cards.totalPatients.title")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.cards.totalPatients.description")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Portal test assignments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.charts.platformTitle")}</CardTitle>
            <CardDescription>{t("dashboard.charts.platformDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardCharts platformData={platformData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.charts.domainTitle")}</CardTitle>
            <CardDescription>{t("dashboard.charts.domainDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DomainBarChart domainData={domainData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Status</CardTitle>
            <CardDescription>Portal test assignment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <AssignmentStatusChart data={assignmentStatusData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Age Distribution</CardTitle>
            <CardDescription>Patients by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <AgeDistributionChart data={ageDistributionData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Completion Rate</CardTitle>
            <CardDescription>Completed vs pending by instrument</CardDescription>
          </CardHeader>
          <CardContent>
            <CompletionRateChart data={completionRateData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recent.title")}</CardTitle>
          <CardDescription>{t("dashboard.recent.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.recent.columns.id")}</TableHead>
                <TableHead>{t("dashboard.recent.columns.patient")}</TableHead>
                <TableHead>{t("dashboard.recent.columns.assessment")}</TableHead>
                <TableHead>{t("dashboard.recent.columns.platform")}</TableHead>
                <TableHead>{t("dashboard.recent.columns.status")}</TableHead>
                <TableHead>{t("dashboard.recent.columns.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">{evaluation.id.substring(0, 8)}...</TableCell>
                  <TableCell>{evaluation.patient.firstName} {evaluation.patient.lastName}</TableCell>
                  <TableCell>{evaluation.assessment.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatPlatform(evaluation.assessment.platform)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        evaluation.status === "COMPLETED" ? "default" :
                        evaluation.status === "IN_PROGRESS" ? "secondary" :
                        "destructive"
                      }
                    >
                      {evaluation.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{evaluation.administeredDate ? formatDate(evaluation.administeredDate) : t("dashboard.recent.notSet")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
