"use client"

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"]

type ScoreDatum = { name: string; score: number; maxScore: number }
type TrendDatum = { date: string; score: number; instrument: string }

export function ScoreBarChart({ data }: { data: ScoreDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 'auto']} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#9ca3af' }} width={80} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#374151', color: '#e5e5e5' }}
          formatter={(value, name, props) => {
            const data = props.payload as ScoreDatum
            return [`${value} / ${data.maxScore}`, 'Score']
          }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PortalTrendChart({ data }: { data: TrendDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#374151', color: '#e5e5e5' }}
          formatter={(value, name, props) => {
            const data = props.payload as TrendDatum
            return [value, data.instrument]
          }}
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={{ r: 4, fill: '#3b82f6' }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
