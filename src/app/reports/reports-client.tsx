"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, FileText, Brain, TrendingUp, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { NormalCurveChart } from "@/components/reports/normal-curve-chart"

type DiagnosticImpression = {
  dsm5Code?: string | null
  icd11Code?: string | null
  severity: string
  evidence?: string | null
}

type NarrativeSection = {
  section: string
  content: string
}

type Recommendation = {
  category: string
  description: string
  priority: string
}

type ReportRow = {
  id: string
  patientId: string
  patientName: string
  evaluationId: string
  assessment: string
  generatedDate: Date
  status: string
  diagnosticImpressions?: DiagnosticImpression[]
  narrativeSections?: NarrativeSection[]
  recommendations?: Recommendation[]
}

export function ReportsClient({ initialReports }: { initialReports: ReportRow[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedReport, setSelectedReport] = useState(initialReports[0] || null)

  const filteredReports = initialReports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.assessment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "default"
      case "IN_PROGRESS": return "secondary"
      case "PENDING_REVIEW": return "destructive"
      default: return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "destructive"
      case "MEDIUM": return "secondary"
      case "LOW": return "outline"
      default: return "outline"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "ACADEMIC_ACCOMMODATIONS": return "Academic Accommodations"
      case "THERAPY": return "Therapy"
      case "EDUCATIONAL_PLANNING": return "Educational Planning"
      case "RE_EVALUATION": return "Re-evaluation"
      default: return category
    }
  }

  // Mock composite scores for the bell curve visualization since we haven't implemented full scoring algorithm yet
  const mockCompositeScores = [
    { index: "VCI", score: 118 },
    { index: "VSI", score: 105 },
    { index: "WMI", score: 98 },
    { index: "PSI", score: 112 },
    { index: "FRI", score: 108 },
    { index: "FSIQ", score: 112 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and manage psychological assessment reports</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialReports.length}</div>
            <p className="text-xs text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialReports.filter(r => r.status === "COMPLETED").length}</div>
            <p className="text-xs text-muted-foreground">Ready for distribution</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialReports.filter(r => r.status === "IN_PROGRESS").length}</div>
            <p className="text-xs text-muted-foreground">Currently being written</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialReports.filter(r => r.status === "PENDING_REVIEW").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Report List</CardTitle>
                <CardDescription>Select a report to view</CardDescription>
              </div>
            </div>
            <div className="flex space-x-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 border border-input rounded-md bg-background text-sm"
              >
                <option value="ALL">All</option>
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING_REVIEW">Pending Review</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReport?.id === report.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{report.patientName}</p>
                      <p className="text-sm text-muted-foreground">{report.assessment}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(report.generatedDate)}</p>
                    </div>
                    <Badge variant={getStatusColor(report.status)} className="text-xs">
                      {report.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedReport && (
            <Tabs defaultValue="scores" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="scores">Scores</TabsTrigger>
                <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                <TabsTrigger value="narrative">Narrative</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scores">
                <div className="space-y-4">
                  <NormalCurveChart scores={mockCompositeScores} />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Composite Scores Detail</CardTitle>
                      <CardDescription>Index scores and percentile ranks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {mockCompositeScores.map((score) => (
                          <div key={score.index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{score.index}</h4>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">{score.score}</div>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, (score.score - 55) / (145 - 55) * 100))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="diagnostics">
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnostic Impressions</CardTitle>
                    <CardDescription>DSM-5 and ICD-11 diagnostic formulations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedReport.diagnosticImpressions?.map((impression, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex space-x-2 mt-1">
                                <Badge variant="outline">{impression.dsm5Code}</Badge>
                                <Badge variant="outline">{impression.icd11Code}</Badge>
                                <Badge variant={getPriorityColor(impression.severity === 'MODERATE' ? 'MEDIUM' : 'LOW')}>
                                  {impression.severity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-1">Supporting Evidence:</h5>
                            <p className="text-sm text-muted-foreground">{impression.evidence}</p>
                          </div>
                        </div>
                      ))}
                      {(!selectedReport.diagnosticImpressions || selectedReport.diagnosticImpressions.length === 0) && (
                        <p className="text-muted-foreground text-sm">No diagnostic impressions recorded.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="narrative">
                <Card>
                  <CardHeader>
                    <CardTitle>Narrative Report</CardTitle>
                    <CardDescription>Structured psychological report sections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedReport.narrativeSections?.map((section) => (
                        <div key={section.section}>
                          <h3 className="text-lg font-semibold mb-2">{section.section}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                      {(!selectedReport.narrativeSections || selectedReport.narrativeSections.length === 0) && (
                        <p className="text-muted-foreground text-sm">No narrative sections recorded.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Evidence-based interventions and accommodations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["ACADEMIC_ACCOMMODATIONS", "THERAPY", "EDUCATIONAL_PLANNING", "RE_EVALUATION"].map((category) => {
                        const categoryRecs = selectedReport.recommendations?.filter((r: Recommendation) => r.category === category) || []
                        if (categoryRecs.length === 0) return null
                        
                        return (
                          <div key={category}>
                            <h3 className="text-lg font-semibold mb-3">{getCategoryLabel(category)}</h3>
                            <div className="space-y-2">
                              {categoryRecs.map((rec, index: number) => (
                                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                  <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                                    {rec.priority}
                                  </Badge>
                                  <p className="text-sm">{rec.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                      {(!selectedReport.recommendations || selectedReport.recommendations.length === 0) && (
                        <p className="text-muted-foreground text-sm">No recommendations recorded.</p>
                      )}
                    </div>
                    
                    <div className="mt-6 flex space-x-4">
                      <Button asChild>
                        <Link href={`/reports/${selectedReport.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Open Report Builder
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
