"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreBarChart, PortalTrendChart } from "./result-charts"
import { useMemo } from "react"
import type { Prisma } from "@prisma/client"

type SessionResult = {
  id: string
  instrumentId: string
  instrumentName: string
  submittedAt: Date | null
  result: {
    totalScore: number
    interpretation: string | null
    details: Prisma.JsonValue | null
  } | null
}

type ChartData = {
  scoreData: { name: string; score: number; maxScore: number }[]
  trendData: { date: string; score: number; instrument: string }[]
}

function formatDateShort(date: Date | null): string {
  if (!date) return ""
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date))
}

function getMaxScore(details: Prisma.JsonValue | null): number {
  if (details && typeof details === "object" && !Array.isArray(details) && "maxScore" in details) {
    return typeof details.maxScore === "number" ? details.maxScore : 10
  }
  return 10
}

export function PortalChartsClient({ sessions }: { sessions: SessionResult[] }) {
  const { scoreData, trendData } = useMemo<ChartData>(() => {
    const submittedSessions = sessions
      .filter(s => s.submittedAt && s.result?.totalScore !== undefined)
      .sort((a, b) => {
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
        return aTime - bTime
      })

    const scoreData = submittedSessions.map(s => ({
      name: s.instrumentName,
      score: s.result?.totalScore ?? 0,
      maxScore: getMaxScore(s.result?.details ?? null),
    }))

    const trendData = submittedSessions.map(s => ({
      date: formatDateShort(s.submittedAt),
      score: s.result?.totalScore ?? 0,
      instrument: s.instrumentName,
    }))

    return { scoreData, trendData }
  }, [sessions])

  if (scoreData.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Results</CardTitle>
          <CardDescription>Your scores across completed assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreBarChart data={scoreData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Trends</CardTitle>
          <CardDescription>Your progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length > 1 ? (
            <PortalTrendChart data={trendData} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Complete more assessments to see your trend over time.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
