"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NormalCurveChart({ scores }: { scores: { index: string; score: number }[] }) {
  // SVG dimensions and viewBox
  const width = 800
  const height = 300
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Normal distribution parameters for standard scores (mean=100, sd=15)
  const mean = 100
  const sd = 15
  
  // X-axis range (55 to 145 = 3 SDs)
  const minX = 55
  const maxX = 145
  
  // Calculate normal distribution curve points
  const points: {x: number, y: number}[] = []
  const steps = 100
  for (let i = 0; i <= steps; i++) {
    const x = minX + (maxX - minX) * (i / steps)
    // Normal distribution formula
    const y = (1 / (sd * Math.sqrt(2 * Math.PI))) * 
              Math.exp(-0.5 * Math.pow((x - mean) / sd, 2))
    points.push({ x, y })
  }

  // Find max Y for scaling
  const maxY = Math.max(...points.map(p => p.y))

  // Helper to map values to SVG coordinates
  const scaleX = (val: number) => padding + ((val - minX) / (maxX - minX)) * chartWidth
  const scaleY = (val: number) => height - padding - (val / maxY) * chartHeight

  // Generate SVG path for the curve
  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`
  ).join(' ')

  // Generate shaded regions (SD bands)
  const generateBand = (startSD: number, endSD: number) => {
    const startX = mean + startSD * sd
    const endX = mean + endSD * sd
    const bandPoints = points.filter(p => p.x >= startX && p.x <= endX)
    
    if (bandPoints.length === 0) return ''
    
    const d = `M ${scaleX(startX)} ${height - padding} ` +
              bandPoints.map(p => `L ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ') +
              ` L ${scaleX(endX)} ${height - padding} Z`
    return d
  }

  // Colors for scores markers
  const getMarkerColor = (index: number) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    return colors[index % colors.length]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Normal Distribution Analysis</CardTitle>
        <CardDescription>Composite scores plotted on the normal curve</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px]">
            {/* Standard Deviation Bands */}
            <path d={generateBand(-3, -2)} fill="#1f2937" opacity="0.3" />
            <path d={generateBand(-2, -1)} fill="#374151" opacity="0.4" />
            <path d={generateBand(-1, 0)} fill="#4b5563" opacity="0.5" />
            <path d={generateBand(0, 1)} fill="#4b5563" opacity="0.5" />
            <path d={generateBand(1, 2)} fill="#374151" opacity="0.4" />
            <path d={generateBand(2, 3)} fill="#1f2937" opacity="0.3" />

            {/* The Bell Curve Line */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="#9ca3af" 
              strokeWidth="2" 
            />

            {/* X Axis Base Line */}
            <line 
              x1={padding} 
              y1={height - padding} 
              x2={width - padding} 
              y2={height - padding} 
              stroke="#4b5563" 
              strokeWidth="2" 
            />

            {/* SD Markers and Labels */}
            {[-3, -2, -1, 0, 1, 2, 3].map((sdValue) => {
              const xPos = scaleX(mean + sdValue * sd)
              return (
                <g key={`sd-${sdValue}`}>
                  <line 
                    x1={xPos} 
                    y1={height - padding} 
                    x2={xPos} 
                    y2={height - padding + 5} 
                    stroke="#9ca3af" 
                  />
                  <text 
                    x={xPos} 
                    y={height - padding + 20} 
                    textAnchor="middle" 
                    fill="#9ca3af" 
                    fontSize="12"
                  >
                    {mean + sdValue * sd}
                  </text>
                  {/* Qualitative Labels */}
                  {sdValue === 0 && (
                    <text x={xPos} y={height - padding + 35} textAnchor="middle" fill="#6b7280" fontSize="10">Average</text>
                  )}
                </g>
              )
            })}

            {/* Score Markers */}
            {scores.map((score, idx) => {
              if (!score.score || score.score < minX || score.score > maxX) return null
              const xPos = scaleX(score.score)
              const yPos = scaleY((1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((score.score - mean) / sd, 2)))
              const color = getMarkerColor(idx)
              
              return (
                <g key={`marker-${idx}`}>
                  {/* Vertical line from curve to axis */}
                  <line 
                    x1={xPos} 
                    y1={yPos} 
                    x2={xPos} 
                    y2={height - padding} 
                    stroke={color} 
                    strokeWidth="2" 
                    strokeDasharray="4 2" 
                    opacity="0.7"
                  />
                  {/* Marker point on curve */}
                  <circle 
                    cx={xPos} 
                    cy={yPos} 
                    r="5" 
                    fill={color} 
                  />
                  {/* Label above curve */}
                  <text 
                    x={xPos} 
                    y={yPos - 10} 
                    textAnchor="middle" 
                    fill={color} 
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {score.index}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {scores.filter(s => s.score).map((score, idx) => (
            <div key={`legend-${idx}`} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMarkerColor(idx) }} />
              <span className="text-sm font-medium">{score.index}: {score.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
