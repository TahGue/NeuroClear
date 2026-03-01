import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardCharts, DomainBarChart } from "@/components/dashboard/charts"
import { Activity, Users, FileText, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPlatform } from "@/lib/utils"
import { getServerLocale, getT } from "@/lib/i18n-server"

async function getDashboardData() {
  const activeEvaluations = await prisma.evaluation.count({
    where: { status: 'IN_PROGRESS' }
  })
  const completedReports = await prisma.report.count()
  const pendingReviews = await prisma.evaluation.count({
    where: { status: 'PENDING_REVIEW' }
  })
  const totalPatients = await prisma.patient.count()

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

  return {
    stats: { activeEvaluations, completedReports, pendingReviews, totalPatients },
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
    ]
  }
}

export default async function Dashboard() {
  const locale = await getServerLocale()
  const t = await getT(locale)
  const { stats, recentEvaluations, platformData, domainData } = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.description")}</p>
      </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
