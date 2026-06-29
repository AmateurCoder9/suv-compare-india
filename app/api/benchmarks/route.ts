import { NextRequest, NextResponse } from 'next/server'
import { getSegmentBenchmarks } from '@/lib/benchmarks'

export async function GET(request: NextRequest) {
  try {
    const benchmarks = await getSegmentBenchmarks()
    return NextResponse.json({ data: benchmarks })
  } catch (error) {
    console.error('Benchmarks API failed:', error)
    return NextResponse.json({ error: 'Benchmarks API failed' }, { status: 500 })
  }
}
