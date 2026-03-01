import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getServerLocale, getT } from "@/lib/i18n-server"
import { ArrowLeft, Users, Clock, ListChecks, Baby, User, UserCog, Calendar } from "lucide-react"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const audienceIcons = {
  PATIENT: User,
  CHILD: Baby,
  TEEN: User,
  ADULT: User,
  SENIOR: UserCog,
}

type AudienceKey = keyof typeof audienceIcons

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getServerLocale()
  const t = await getT(locale)

  const instrument = await prisma.instrument.findFirst({
    where: {
      slug,
      locale: "en",
    },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          assignments: true,
          sessions: true,
        },
      },
    },
  })

  if (!instrument) {
    notFound()
  }

  const AudienceIcon = audienceIcons[instrument.audience as AudienceKey] || User

  const audienceLabels: Record<string, string> = {
    PATIENT: t("tests.audiences.patient"),
    CHILD: t("tests.audiences.child"),
    TEEN: t("tests.audiences.teen"),
    ADULT: t("tests.audiences.adult"),
    SENIOR: t("tests.audiences.senior"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{instrument.name}</h1>
          <p className="text-muted-foreground">{instrument.description}</p>
        </div>
        <Button asChild>
          <Link href={`/tests/${slug}/assign`}>
            <Users className="h-4 w-4 mr-2" />
            {t("tests.detail.assignToPatient")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("tests.detail.audience")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AudienceIcon className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium">{audienceLabels[instrument.audience] || instrument.audience}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("tests.detail.ageRange")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium">
                {instrument.minAgeYears && instrument.maxAgeYears
                  ? `${instrument.minAgeYears}-${instrument.maxAgeYears} ${t("tests.years")}`
                  : instrument.minAgeYears
                  ? `${instrument.minAgeYears}+ ${t("tests.years")}`
                  : t("common.notAvailable")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("tests.detail.questions")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium">{instrument.items.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("tests.detail.statistics")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{t("tests.detail.totalAssignments")}</span>
              </div>
              <span className="text-2xl font-bold">{instrument._count.assignments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{t("tests.detail.totalCompletions")}</span>
              </div>
              <span className="text-2xl font-bold">{instrument._count.sessions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("tests.detail.questions")}</CardTitle>
            <CardDescription>{t("tests.detail.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {instrument.items.map((item, index) => (
                <div key={item.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-sm">{item.prompt}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {(item.options as { label: string; value: number }[] | null)?.map((option, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {option.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
