"use client"

import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"]
const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "#6b7280",
  IN_PROGRESS: "#3b82f6",
  SUBMITTED: "#10b981",
  EXPIRED: "#ef4444",
}

type PlatformDatum = { name: string; value: number }
type DomainDatum = { domain: string; count: number }
type TrendDatum = { date: string; score: number }
type StatusDatum = { name: string; value: number; color: string }
type AgeGroupDatum = { range: string; count: number }

export function DashboardCharts({ platformData }: { platformData: PlatformDatum[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={platformData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {platformData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px"
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {platformData.map((item, index) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export function DomainBarChart({ domainData }: { domainData: DomainDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={domainData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="domain" 
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
          axisLine={false}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }} 
        />
        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ScoreTrendChart({ data }: { data: TrendDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }} 
        />
        <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function AssignmentStatusChart({ data }: { data: StatusDatum[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
            axisLine={false} 
            tickLine={false}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px"
            }} 
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export function AgeDistributionChart({ data }: { data: AgeGroupDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="range" 
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }} 
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CompletionRateChart({ data }: { data: { name: string; completed: number; pending: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
          axisLine={false}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }} 
        />
        <Legend />
        <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
