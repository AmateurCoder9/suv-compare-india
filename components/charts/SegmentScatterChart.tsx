'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Loader2 } from 'lucide-react'

interface ScatterItem {
  slug: string
  variantName: string
  modelName: string
  manufacturerName: string
  priceInrLakh: number
  score: number
}

const MFR_COLORS: Record<string, string> = {
  'Kia':        '#E50F1D',
  'Hyundai':    '#003087',
  'Skoda':      '#1C6727',
  'Volkswagen': '#001E50',
  'Honda':      '#CC0000',
  'MG':         '#F20D0D',
  'Citroën':    '#DA251D',
  'Citroen':    '#DA251D'
}

export function SegmentScatterChart() {
  const router = useRouter()
  const [category, setCategory] = useState<string>('Overall')
  const [data, setData] = useState<ScatterItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/scatter?scoreCategory=${encodeURIComponent(category)}`)
        if (res.ok) {
          const json = await res.json()
          setData(json.data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [category])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: ScatterItem = payload[0].payload
      return (
        <div className="bg-[var(--surface-0)] border border-[var(--surface-3)] p-3 rounded-lg shadow-[var(--shadow-md)] text-xs space-y-1">
          <div className="font-bold text-[var(--text-primary)]">
            {item.manufacturerName} {item.modelName} {item.variantName}
          </div>
          <div className="text-[var(--text-secondary)]">Price: <strong>₹{item.priceInrLakh.toFixed(2)} Lakh</strong></div>
          <div className="text-[var(--text-secondary)]">Score: <strong>{item.score}/200</strong></div>
          <div className="text-[10px] text-[var(--accent-color)] font-semibold mt-1">Click to view details</div>
        </div>
      )
    }
    return null
  }

  const handlePointClick = (point: ScatterItem) => {
    if (point && point.slug) {
      router.push(`/variants/${point.slug}`)
    }
  }

  return (
    <div className="border border-[var(--surface-3)] bg-[var(--surface-1)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--surface-3)] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Score vs Price Mapping</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Identify sweet spots based on scores vs prices</p>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[var(--surface-2)] border border-[var(--surface-3)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
        >
          <option value="Overall">Overall Score</option>
          <option value="Value for Money">Value for Money</option>
          <option value="Tech & Features">Tech & Features</option>
          <option value="Safety">Safety</option>
          <option value="Comfort">Comfort</option>
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-color)]" />
          <span className="text-xs text-[var(--text-secondary)] mt-2">Generating chart...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[640px] h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 25, bottom: 15, left: 10 }}>
                <XAxis 
                  type="number" 
                  dataKey="priceInrLakh" 
                  name="Price" 
                  unit="L" 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  style={{ fontSize: 10, fontWeight: 500 }}
                  label={{ value: 'Ex-Showroom Price (₹ Lakh)', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 } }}
                />
                <YAxis 
                  type="number" 
                  dataKey="score" 
                  name="Score" 
                  domain={[80, 200]}
                  style={{ fontSize: 10, fontWeight: 500 }}
                  label={{ value: 'Score / 200', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 } }}
                />
                <ZAxis type="number" range={[100, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  data={data} 
                  onClick={(e) => handlePointClick(e as unknown as ScatterItem)}
                  className="cursor-pointer"
                >
                  {data.map((entry, index) => {
                    const color = MFR_COLORS[entry.manufacturerName] || '#8E8E93'
                    return (
                      <Cell key={`cell-${index}`} fill={color} stroke="#FFF" strokeWidth={1} />
                    )
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Legend Map */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] justify-center text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-2 border-t border-[var(--surface-3)] pt-2.5">
        {Object.entries(MFR_COLORS).map(([mfr, color]) => (
          <div key={mfr} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {mfr}
          </div>
        ))}
      </div>
    </div>
  )
}
