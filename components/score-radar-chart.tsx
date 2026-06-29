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
  comparisonData?: {
    category: string
    scoreA: number
    scoreB: number
    variantNameA: string
    variantNameB: string
  }[]
}

export function ScoreRadarChart({ data, comparisonData }: ScoreRadarChartProps) {
  const isComparison = comparisonData && comparisonData.length > 0
  const chartData = isComparison ? comparisonData : data

  // Dynamic domains (individual categories max is 200, overall is 200)
  const maxDomain = 200

  return (
    <div className="w-full h-[320px] flex flex-col justify-between">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid 
              stroke="var(--surface-3)" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 600 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, maxDomain]} 
              tick={{ fill: 'var(--text-tertiary)', fontSize: 8 }} 
            />
            
            {isComparison ? (
              <>
                <Radar
                  name={comparisonData[0]?.variantNameA || "Vehicle 1"}
                  dataKey="scoreA"
                  stroke="var(--accent-color)"
                  fill="var(--accent-color)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name={comparisonData[0]?.variantNameB || "Vehicle 2"}
                  dataKey="scoreB"
                  stroke="var(--amber)"
                  fill="var(--amber)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </>
            ) : (
              <Radar
                name="Score"
                dataKey="score"
                stroke="var(--accent-color)"
                fill="var(--accent-color)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            )}
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface-0)',
                borderColor: 'var(--surface-3)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                padding: '8px 14px',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {isComparison && (
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[var(--accent-light)] border border-[var(--accent-color)] rounded-sm" />
            {comparisonData[0]?.variantNameA || "Vehicle 1"}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[var(--amber-light)] border border-[var(--amber)] rounded-sm" />
            {comparisonData[0]?.variantNameB || "Vehicle 2"}
          </div>
        </div>
      )}
    </div>
  )
}
