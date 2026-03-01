"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SeverityLevel } from "@/lib/instrument-scoring"

type ResultData = {
  totalScore: number
  maxScore?: number
  interpretation: string
  severity?: SeverityLevel
  percentile?: number
  subscales?: Record<string, { score: number; interpretation: string }>
}

type ResultChartProps = {
  instrumentName: string
  result: ResultData
  showPercentile?: boolean
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  minimal: "#22c55e",
  mild: "#eab308",
  moderate: "#f97316",
  severe: "#ef4444",
  none: "#6b7280",
}

const SEVERITY_BG_COLORS: Record<SeverityLevel, string> = {
  minimal: "bg-green-500",
  mild: "bg-yellow-500",
  moderate: "bg-orange-500",
  severe: "bg-red-500",
  none: "bg-gray-500",
}

export function ResultChart({ instrumentName, result, showPercentile = false }: ResultChartProps) {
  const { totalScore, maxScore, interpretation, severity, percentile, subscales } = result

  const chartData = [
    {
      name: "Score",
      value: totalScore,
      maxValue: maxScore || 100,
    },
  ]

  const percentage = maxScore ? Math.round((totalScore / maxScore) * 100) : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{instrumentName}</CardTitle>
          {severity && (
            <Badge className={SEVERITY_BG_COLORS[severity]}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          )}
        </div>
        <CardDescription>{interpretation}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Score</span>
            <span className="font-semibold">
              {totalScore}
              {maxScore && ` / ${maxScore}`}
              {percentage !== null && ` (${percentage}%)`}
            </span>
          </div>

          {showPercentile && percentile !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Percentile</span>
              <span className="font-semibold">{percentile}th</span>
            </div>
          )}

          {maxScore && (
            <div className="h-4 w-full rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(percentage || 0, 100)}%`,
                  backgroundColor: severity ? SEVERITY_COLORS[severity] : "#3b82f6",
                }}
              />
            </div>
          )}

          {subscales && Object.keys(subscales).length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Subscales</h4>
              <div className="space-y-1">
                {Object.entries(subscales).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{name}</span>
                    <span>
                      {data.score} — <span className="text-xs">{data.interpretation}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

type ResultsHistoryChartProps = {
  data: Array<{
    date: string
    score: number
    instrumentName: string
    severity?: SeverityLevel
  }>
}

export function ResultsHistoryChart({ data }: ResultsHistoryChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No results history available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results Over Time</CardTitle>
        <CardDescription>Track your progress across assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.severity ? SEVERITY_COLORS[entry.severity] : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
