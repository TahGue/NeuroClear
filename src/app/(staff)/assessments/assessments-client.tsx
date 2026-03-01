"use client"

import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n-context"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, BookOpen, Clock, Users, Brain, FileText, Layers, Monitor } from "lucide-react"
import { Assessment, AssessmentDomain, AssessmentPlatform } from "@prisma/client"
import { formatPlatform } from "@/lib/utils"
import { AssignEvaluationModal } from "@/components/assessments/assign-evaluation-modal"

type AssessmentData = Assessment & {
  subtestCount: number
}

type DomainStat = { domain: string; count: number }
type PlatformStat = { platform: string; count: number }

export function AssessmentsClient({ 
  initialAssessments,
  domainStats,
  platformStats,
  patients,
  users
}: { 
  initialAssessments: AssessmentData[]
  domainStats: DomainStat[]
  platformStats: PlatformStat[]
  patients: { id: string, firstName: string, lastName: string }[]
  users: { id: string, name: string | null }[]
}) {
  const { t } = useI18n()
  const [searchTerm, setSearchTerm] = useState("")
  const [domainFilter, setDomainFilter] = useState("ALL")
  const [platformFilter, setPlatformFilter] = useState("ALL")
  const [ageRangeFilter, setAgeRangeFilter] = useState("ALL")

  const filteredAssessments = initialAssessments.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (assessment.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesDomain = domainFilter === "ALL" || assessment.domain === domainFilter
    const matchesPlatform = platformFilter === "ALL" || assessment.platform === platformFilter
    
    let matchesAgeRange = true
    if (ageRangeFilter !== "ALL") {
      const [minAge, maxAge] = ageRangeFilter.split("-").map(Number)
      matchesAgeRange = assessment.minAge <= (maxAge || 99) && assessment.maxAge >= minAge
    }
    
    return matchesSearch && matchesDomain && matchesPlatform && matchesAgeRange
  })

  const getDomainColor = (domain: string) => {
    const colors = {
      COGNITIVE: "bg-[var(--status-info)]/10 text-[var(--status-info)]",
      ADAPTIVE: "bg-[var(--status-success)]/10 text-[var(--status-success)]",
      BEHAVIORAL: "bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
      EXECUTIVE_FUNCTION: "bg-[var(--category-secondary)]/10 text-[var(--category-secondary)]",
      ACADEMIC: "bg-[var(--category-tertiary)]/10 text-[var(--category-tertiary)]",
      EMOTIONAL: "bg-[var(--category-accent)]/10 text-[var(--category-accent)]",
      SOCIAL: "bg-[var(--category-primary)]/10 text-[var(--category-primary)]",
    }
    return colors[domain as keyof typeof colors] || "bg-muted text-muted-foreground"
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      "Q_INTERACTIVE": "bg-[var(--status-info)]/10 text-[var(--status-info)]",
      "Q_GLOBAL": "bg-[var(--status-success)]/10 text-[var(--status-success)]",
      "MHS_ONLINE": "bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
      "ALTO": "bg-[var(--category-accent)]/10 text-[var(--category-accent)]",
    }
    return colors[platform as keyof typeof colors] || "bg-muted text-muted-foreground"
  }

  const getDomainLabel = (domain: string) => {
    const labels = {
      COGNITIVE: "Cognitive",
      ADAPTIVE: "Adaptive",
      BEHAVIORAL: "Behavioral",
      EXECUTIVE_FUNCTION: "Executive Function",
      ACADEMIC: "Academic",
      EMOTIONAL: "Emotional",
      SOCIAL: "Social",
    }
    return labels[domain as keyof typeof labels] || domain
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("assessments.library")}</h1>
          <p className="text-muted-foreground">{t("assessments.description")}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("assessments.addAssessment")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("assessments.stats.total")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialAssessments.length}</div>
            <p className="text-xs text-muted-foreground">{t("assessments.stats.available")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("assessments.domain")}</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domainStats.length}</div>
            <p className="text-xs text-muted-foreground">{t("assessments.stats.domains")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("assessments.platform")}</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.length}</div>
            <p className="text-xs text-muted-foreground">{t("assessments.stats.platforms")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("assessments.stats.avgDuration")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45m</div>
            <p className="text-xs text-muted-foreground">{t("assessments.stats.avgTime")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.charts.domainTitle")}</CardTitle>
            <CardDescription>{t("dashboard.charts.domainDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {domainStats.map(({ domain, count }) => (
                <div key={domain} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getDomainColor(domain)}>
                      {getDomainLabel(domain)}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.charts.platformTitle")}</CardTitle>
            <CardDescription>{t("dashboard.charts.platformDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platformStats.map(({ platform, count }) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getPlatformColor(platform)}>
                      {formatPlatform(platform)}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t("assessments.catalog.title")}</CardTitle>
              <CardDescription>{t("assessments.catalog.description")}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("assessments.catalog.searchPlaceholder")} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("assessments.domain")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("assessments.filters.allDomains")}</SelectItem>
                  {Object.values(AssessmentDomain).map(domain => (
                    <SelectItem key={domain} value={domain}>{getDomainLabel(domain)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("assessments.platform")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("assessments.filters.allPlatforms")}</SelectItem>
                  {Object.values(AssessmentPlatform).map(platform => (
                    <SelectItem key={platform} value={platform}>{formatPlatform(platform)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ageRangeFilter} onValueChange={setAgeRangeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("assessments.filters.ageGroup")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("assessments.filters.allAges")}</SelectItem>
                  <SelectItem value="0-5">0-5 years</SelectItem>
                  <SelectItem value="6-12">6-12 years</SelectItem>
                  <SelectItem value="13-18">13-18 years</SelectItem>
                  <SelectItem value="19-25">19-25 years</SelectItem>
                  <SelectItem value="26-50">26-50 years</SelectItem>
                  <SelectItem value="51-99">51+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{assessment.name}</CardTitle>
                      <CardDescription className="mt-1">{assessment.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge className={getDomainColor(assessment.domain)}>
                      {getDomainLabel(assessment.domain)}
                    </Badge>
                    <Badge className={getPlatformColor(assessment.platform)}>
                      {formatPlatform(assessment.platform)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("assessments.catalog.ageRange")}:</span>
                      <span>{assessment.minAge}-{assessment.maxAge} {t("patients.table.ageSuffix")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("assessments.catalog.subtests")}:</span>
                      <span>{assessment.subtestCount}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/score-entry?assessmentId=${assessment.id}`}>
                        {t("patients.quickActions.startNewEvaluation")}
                      </Link>
                    </Button>
                    <AssignEvaluationModal 
                      assessmentId={assessment.id} 
                      patients={patients} 
                      users={users}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
