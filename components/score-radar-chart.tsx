"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface ScoreRadarChartProps {
  data: {
    category: string
    score: number
  }[]
}

export function ScoreRadarChart({ data }: ScoreRadarChartProps) {
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid 
            stroke="oklch(0.3 0.015 260)" 
            strokeDasharray="3 3"
          />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 1000]} 
            tick={{ fill: 'oklch(0.5 0 0)', fontSize: 9 }} 
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="oklch(0.72 0.19 145)"
            fill="oklch(0.72 0.19 145)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'oklch(0.16 0.01 260)',
              borderColor: 'oklch(0.25 0.015 260)',
              color: 'oklch(0.96 0 0)',
              borderRadius: '12px',
              fontSize: '13px',
              padding: '8px 14px',
            }}
            itemStyle={{ color: 'oklch(0.72 0.19 145)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
