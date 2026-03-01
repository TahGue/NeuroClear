"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, Users, Clock, Brain, Baby, User, GraduationCap, Heart, HeartPulse, Activity, Target, Lightbulb, UsersRound, Sparkles, Cog, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, Grid, List } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { InstrumentCategory, InstrumentStatus } from "@prisma/client"

type InstrumentData = {
  id: string
  slug: string
  name: string
  description: string | null
  status: InstrumentStatus
  category: InstrumentCategory
  audience: string
  minAgeYears: number | null
  maxAgeYears: number | null
  _count: {
    items: number
    assignments: number
    sessions: number
  }
}

type SortField = "name" | "category" | "audience" | "items" | "assignments"
type SortDirection = "asc" | "desc"
type ViewMode = "grid" | "list"

const audienceConfig = {
  PATIENT: { icon: User, color: "bg-[var(--audience-patient)]/10 text-[var(--audience-patient)] border-[var(--audience-patient)]/30", gradient: "from-[var(--audience-patient)]/5" },
  CHILD: { icon: Baby, color: "bg-[var(--audience-child)]/10 text-[var(--audience-child)] border-[var(--audience-child)]/30", gradient: "from-[var(--audience-child)]/5" },
  TEEN: { icon: GraduationCap, color: "bg-[var(--audience-teen)]/10 text-[var(--audience-teen)] border-[var(--audience-teen)]/30", gradient: "from-[var(--audience-teen)]/5" },
  ADULT: { icon: User, color: "bg-[var(--audience-adult)]/10 text-[var(--audience-adult)] border-[var(--audience-adult)]/30", gradient: "from-[var(--audience-adult)]/5" },
  SENIOR: { icon: Heart, color: "bg-[var(--audience-senior)]/10 text-[var(--audience-senior)] border-[var(--audience-senior)]/30", gradient: "from-[var(--audience-senior)]/5" },
}

const categoryConfig: Record<InstrumentCategory, { icon: React.ComponentType<{ className?: string }>, color: string, label: string }> = {
  DEPRESSION_ANXIETY: { icon: HeartPulse, color: "text-[var(--status-error)]", label: "Depression & Anxiety" },
  ADHD_ATTENTION: { icon: Target, color: "text-[var(--status-warning)]", label: "ADHD & Attention" },
  BEHAVIORAL: { icon: UsersRound, color: "text-[var(--category-secondary)]", label: "Behavioral" },
  SUBSTANCE_USE: { icon: Activity, color: "text-[var(--status-error)]", label: "Substance Use" },
  COGNITIVE: { icon: Cog, color: "text-[var(--status-info)]", label: "Cognitive" },
  IQ_INTELLIGENCE: { icon: Lightbulb, color: "text-[var(--status-warning)]", label: "IQ & Intelligence" },
  EMOTIONAL_SOCIAL: { icon: Heart, color: "text-[var(--category-accent)]", label: "Emotional & Social" },
  DEVELOPMENTAL: { icon: Sparkles, color: "text-[var(--category-secondary)]", label: "Developmental" },
}

type AudienceKey = keyof typeof audienceConfig

export function TestsClient({ initialInstruments }: { initialInstruments: InstrumentData[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<InstrumentCategory | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | InstrumentStatus>("ALL")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const { t } = useI18n()

  const filteredInstruments = useMemo(() => {
    let filtered = initialInstruments.filter(instrument => {
      const matchesSearch = instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (instrument.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "ALL" || instrument.category === categoryFilter
      const matchesStatus = statusFilter === "ALL" || instrument.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "audience":
          comparison = a.audience.localeCompare(b.audience)
          break
        case "items":
          comparison = a._count.items - b._count.items
          break
        case "assignments":
          comparison = a._count.assignments - b._count.assignments
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [initialInstruments, searchTerm, categoryFilter, statusFilter, sortField, sortDirection])

  // Group by category for grid view
  const groupedInstruments = useMemo(() => {
    const grouped: Partial<Record<InstrumentCategory, InstrumentData[]>> = {}
    for (const instrument of filteredInstruments) {
      if (!grouped[instrument.category]) {
        grouped[instrument.category] = []
      }
      grouped[instrument.category]!.push(instrument)
    }
    return grouped
  }, [filteredInstruments])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const audienceLabels: Record<string, string> = {
    PATIENT: t("tests.audiences.patient"),
    CHILD: t("tests.audiences.child"),
    TEEN: t("tests.audiences.teen"),
    ADULT: t("tests.audiences.adult"),
    SENIOR: t("tests.audiences.senior"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("tests.title")}</h1>
          <p className="text-muted-foreground">{t("tests.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters and Sort */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("tests.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as InstrumentCategory | "ALL")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("tests.filters.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("tests.filters.allCategories")}</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "ALL" | InstrumentStatus)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("tests.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("tests.filters.allStatus")}</SelectItem>
                <SelectItem value="ACTIVE">{t("tests.status.active")}</SelectItem>
                <SelectItem value="INACTIVE">{t("tests.status.inactive")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("tests.sortBy")}:</span>
              <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t("tests.sortOptions.name")}</SelectItem>
                  <SelectItem value="category">{t("tests.sortOptions.category")}</SelectItem>
                  <SelectItem value="audience">{t("tests.sortOptions.audience")}</SelectItem>
                  <SelectItem value="items">{t("tests.sortOptions.items")}</SelectItem>
                  <SelectItem value="assignments">{t("tests.sortOptions.assignments")}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}>
                {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredInstruments.length} {t("tests.resultsFound")}
      </div>

      {/* Grid View */}
      {viewMode === "grid" && Object.entries(groupedInstruments).map(([category, categoryInstruments]) => {
        const catConfig = categoryConfig[category as InstrumentCategory]
        const CatIcon = catConfig.icon

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-2">
              <CatIcon className={`h-5 w-5 ${catConfig.color}`} />
              <h2 className="text-xl font-semibold">{catConfig.label}</h2>
              <Badge variant="secondary" className="ml-2">{categoryInstruments!.length}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryInstruments!.map((instrument) => {
                const config = audienceConfig[instrument.audience as AudienceKey] || audienceConfig.PATIENT
                const AudienceIcon = config.icon

                return (
                  <Card key={instrument.id} className={`flex flex-col bg-gradient-to-br ${config.gradient} to-background hover:shadow-lg transition-shadow`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <Brain className="h-4 w-4" />
                          </div>
                          <CardTitle className="text-lg">{instrument.name}</CardTitle>
                        </div>
                        <Badge variant={instrument.status === "ACTIVE" ? "default" : "secondary"} className="shrink-0">
                          {instrument.status === "ACTIVE" ? t("tests.status.active") : t("tests.status.inactive")}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">
                        {instrument.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`${config.color} border`}>
                            <AudienceIcon className="h-3 w-3 mr-1" />
                            {audienceLabels[instrument.audience] || instrument.audience}
                          </Badge>
                          {(instrument.minAgeYears || instrument.maxAgeYears) && (
                            <Badge variant="outline" className="text-muted-foreground">
                              {instrument.minAgeYears && instrument.maxAgeYears
                                ? `${instrument.minAgeYears}-${instrument.maxAgeYears} ${t("tests.years")}`
                                : instrument.minAgeYears
                                ? `${instrument.minAgeYears}+ ${t("tests.years")}`
                                : `≤${instrument.maxAgeYears} ${t("tests.years")}`}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{instrument._count.items} {t("tests.items")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{instrument._count.assignments} {t("tests.assigned")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{instrument._count.sessions} {t("tests.completed")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/tests/${instrument.slug}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            {t("tests.buttons.view")}
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/tests/${instrument.slug}/assign`}>
                            <Plus className="h-4 w-4 mr-1" />
                            {t("tests.buttons.assign")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredInstruments.map((instrument) => {
                const config = audienceConfig[instrument.audience as AudienceKey] || audienceConfig.PATIENT
                const AudienceIcon = config.icon
                const catConfig = categoryConfig[instrument.category]
                const CatIcon = catConfig.icon

                return (
                  <div key={instrument.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{instrument.name}</span>
                        <Badge variant={instrument.status === "ACTIVE" ? "default" : "secondary"} className="shrink-0">
                          {instrument.status === "ACTIVE" ? t("tests.status.active") : t("tests.status.inactive")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CatIcon className={`h-3 w-3 ${catConfig.color}`} />
                          <span>{catConfig.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AudienceIcon className="h-3 w-3" />
                          <span>{audienceLabels[instrument.audience] || instrument.audience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{instrument._count.items} {t("tests.items")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{instrument._count.assignments} {t("tests.assigned")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/tests/${instrument.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/tests/${instrument.slug}/assign`}>
                          <Plus className="h-4 w-4 mr-1" />
                          {t("tests.buttons.assign")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredInstruments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t("tests.noTests")}</h3>
          <p className="text-muted-foreground">{t("tests.noTestsDescription")}</p>
        </div>
      )}
    </div>
  )
}
