import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardCharts, DomainBarChart } from "@/components/dashboard/charts"
import { Activity, Users, FileText, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPlatform } from "@/lib/utils"

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
  const { stats, recentEvaluations, platformData, domainData } = await getDashboardData()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Overview of assessment platform activity</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Evaluations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeEvaluations}</div>
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedReports}</div>
                  <p className="text-xs text-muted-foreground">Ready for distribution</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground">Registered in platform</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity Breakdown</CardTitle>
                  <CardDescription>Distribution of assessments by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardCharts platformData={platformData} domainData={domainData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Domain Distribution</CardTitle>
                  <CardDescription>Assessments by domain type</CardDescription>
                </CardHeader>
                <CardContent>
                  <DomainBarChart domainData={domainData} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Evaluations</CardTitle>
                <CardDescription>Latest assessment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
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
                        <TableCell>{evaluation.administeredDate ? formatDate(evaluation.administeredDate) : 'Not set'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
