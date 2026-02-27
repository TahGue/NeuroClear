"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"]

export function DashboardCharts({ platformData, domainData }: { platformData: any[], domainData: any[] }) {
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
          <Tooltip />
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

export function DomainBarChart({ domainData }: { domainData: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={domainData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="domain" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#374151', color: '#e5e5e5' }} />
        <Bar dataKey="count" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}
