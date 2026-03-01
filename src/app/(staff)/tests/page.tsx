import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getServerLocale, getT } from "@/lib/i18n-server"
import { Plus, Eye, Users, Clock, Brain, Baby, User, GraduationCap, Heart, HeartPulse, Activity, Target, Lightbulb, UsersRound, Sparkles, Cog } from "lucide-react"
import { InstrumentCategory } from "@prisma/client"

export const dynamic = "force-dynamic"

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

export default async function AdminTestsPage() {
  const locale = await getServerLocale()
  const t = await getT(locale)

  // Get all unique instruments (by slug) with English as base
  const instruments = await prisma.instrument.findMany({
    where: { locale: "en" },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          items: true,
          assignments: true,
          sessions: true,
        },
      },
    },
  })

  // Group instruments by category
  const groupedInstruments = instruments.reduce((acc, instrument) => {
    const cat = instrument.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(instrument)
    return acc
  }, {} as Record<InstrumentCategory, typeof instruments>)

  const audienceLabels: Record<string, string> = {
    PATIENT: t("instruments.audiences.patient"),
    CHILD: t("instruments.audiences.child"),
    TEEN: t("instruments.audiences.teen"),
    ADULT: t("instruments.audiences.adult"),
    SENIOR: t("instruments.audiences.senior"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("tests.title")}</h1>
          <p className="text-muted-foreground">{t("tests.description")}</p>
        </div>
      </div>

      {Object.entries(groupedInstruments).map(([category, categoryInstruments]) => {
        const catConfig = categoryConfig[category as InstrumentCategory]
        const CatIcon = catConfig.icon

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-2">
              <CatIcon className={`h-5 w-5 ${catConfig.color}`} />
              <h2 className="text-xl font-semibold">{catConfig.label}</h2>
              <Badge variant="secondary" className="ml-2">{categoryInstruments.length}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryInstruments.map((instrument) => {
                const config = audienceConfig[instrument.audience as AudienceKey] || audienceConfig.PATIENT
                const AudienceIcon = config.icon
                const totalAssignments = instrument._count.assignments
                const totalSessions = instrument._count.sessions
                const itemCount = instrument._count.items

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
                            <span>{itemCount} {t("tests.items")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{totalAssignments} {t("tests.assigned")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{totalSessions} {t("tests.completed")}</span>
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

      {instruments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t("tests.noTests")}</h3>
          <p className="text-muted-foreground">{t("tests.noTestsDescription")}</p>
        </div>
      )}
    </div>
  )
}
