import { db } from './db'

export interface BenchmarkStat {
  min: number
  max: number
  avg: number
  best: string // variant name
}

export interface SegmentBenchmarks {
  bootLitres:         BenchmarkStat
  wheelbaseMm:        BenchmarkStat
  groundClearanceMm:  BenchmarkStat
  maxPowerBhp:        BenchmarkStat
  maxTorqueNm:        BenchmarkStat
  araiKmpl:           BenchmarkStat
  kerbWeightKg:       BenchmarkStat
}

export interface BenchmarkLabel {
  tag: 'best' | 'above-avg' | 'avg' | 'below-avg' | 'worst'
  text: string
  color: string
}

// Fallback benchmarks in case tables are unpopulated in SQLite
const fallbackBenchmarks: SegmentBenchmarks = {
  bootLitres:         { min: 350, max: 587, avg: 433, best: "MG Hector Savvy" },
  wheelbaseMm:        { min: 2500, max: 2750, avg: 2610, best: "MG Hector Savvy" },
  groundClearanceMm:  { min: 180, max: 220, avg: 198, best: "Kia Seltos GTX(A)" },
  maxPowerBhp:        { min: 100, max: 160, avg: 121, best: "Hyundai Creta SX(O)" },
  maxTorqueNm:        { min: 140, max: 250, avg: 188, best: "Volkswagen Taigun GT Plus" },
  araiKmpl:           { min: 14.2, max: 20.3, avg: 17.1, best: "Citroën Basalt Feel" },
  kerbWeightKg:       { min: 1150, max: 1450, avg: 1270, best: "Skoda Kushaq Monte Carlo" }
}

export async function getSegmentBenchmarks(): Promise<SegmentBenchmarks> {
  try {
    const variants = await db.variant.findMany({
      include: {
        model: true,
        dimensions: true,
        engine: true,
        fuelEconomy: true
      }
    })

    const populated = variants.filter(v => v.dimensions || v.engine || v.fuelEconomy)
    if (populated.length === 0) {
      return fallbackBenchmarks
    }

    const getStat = (
      extractor: (v: typeof variants[0]) => number | null | undefined,
      defaultStat: BenchmarkStat
    ): BenchmarkStat => {
      const values = variants
        .map(v => ({ val: extractor(v), name: `${v.model.name} ${v.name}` }))
        .filter((item): item is { val: number; name: string } => typeof item.val === 'number' && item.val > 0)
      
      if (values.length === 0) return defaultStat

      const min = Math.min(...values.map(i => i.val))
      const max = Math.max(...values.map(i => i.val))
      const avg = Math.round(values.reduce((sum, i) => sum + i.val, 0) / values.length)
      
      const bestItem = values.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), values[0])

      return { min, max, avg, best: bestItem.name }
    }

    return {
      bootLitres: getStat(v => v.dimensions?.bootLitres, fallbackBenchmarks.bootLitres),
      wheelbaseMm: getStat(v => v.dimensions?.wheelbaseMm, fallbackBenchmarks.wheelbaseMm),
      groundClearanceMm: getStat(v => v.dimensions?.groundClearanceMm, fallbackBenchmarks.groundClearanceMm),
      maxPowerBhp: getStat(v => v.engine?.maxPowerBhp, fallbackBenchmarks.maxPowerBhp),
      maxTorqueNm: getStat(v => v.engine?.maxTorqueNm, fallbackBenchmarks.maxTorqueNm),
      araiKmpl: getStat(v => v.fuelEconomy?.araiKmpl, fallbackBenchmarks.araiKmpl),
      kerbWeightKg: getStat(v => v.dimensions?.kerbWeightKg, fallbackBenchmarks.kerbWeightKg)
    }
  } catch (error) {
    console.error('Failed to compute live benchmarks, using fallback:', error)
    return fallbackBenchmarks
  }
}

export function getBenchmarkLabel(
  field: keyof SegmentBenchmarks,
  value: number,
  benchmarks: SegmentBenchmarks
): BenchmarkLabel {
  const stat = benchmarks[field]
  if (!stat) {
    return { tag: 'avg', text: 'Avg', color: 'var(--text-tertiary)' }
  }

  // Best is top 5% range
  const range = stat.max - stat.min
  const bestThreshold = stat.max - range * 0.05
  const aboveAvgThreshold = stat.avg + range * 0.1
  const belowAvgThreshold = stat.avg - range * 0.1
  const worstThreshold = stat.min + range * 0.05

  if (value >= bestThreshold) {
    return { tag: 'best', text: '← Best in segment', color: 'var(--green)' }
  }
  if (value >= aboveAvgThreshold) {
    return { tag: 'above-avg', text: 'Above avg', color: 'var(--accent-color)' }
  }
  if (value <= worstThreshold) {
    return { tag: 'worst', text: 'Lowest in segment', color: 'var(--red)' }
  }
  if (value <= belowAvgThreshold) {
    return { tag: 'below-avg', text: 'Below avg', color: 'var(--amber)' }
  }
  
  return { tag: 'avg', text: 'Avg', color: 'var(--text-tertiary)' }
}
