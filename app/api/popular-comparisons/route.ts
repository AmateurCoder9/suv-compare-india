import { NextRequest, NextResponse } from 'next/server'

export const POPULAR_COMPARISONS = [
  { a: 'kia-seltos-htxa',          b: 'hyundai-creta-sx-tech',     label: 'Seltos HTX(A) vs Creta SX Tech' },
  { a: 'kia-seltos-gtxa',          b: 'hyundai-creta-sx-o',        label: 'Seltos GTX(A) vs Creta SX(O)' },
  { a: 'volkswagen-taigun-topline', b: 'skoda-kushaq-style',        label: 'Taigun Topline vs Kushaq Style' },
  { a: 'honda-elevate-zx-advance',  b: 'hyundai-creta-sx-tech',     label: 'Elevate ZX Advance vs Creta SX Tech' },
  { a: 'kia-seltos-gtx',           b: 'volkswagen-taigun-gt-plus',  label: 'Seltos GTX vs Taigun GT Plus' },
  { a: 'mg-hector-sharp',          b: 'hyundai-creta-sx-o',        label: 'Hector Sharp vs Creta SX(O)' },
  { a: 'honda-elevate-vx',         b: 'hyundai-venue-sx-o',         label: 'Elevate VX vs Venue SX(O)' },
  { a: 'citroen-basalt-shine',     b: 'hyundai-venue-sx-o',        label: 'Basalt Shine+ vs Venue SX(O)' },
] as const

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ data: POPULAR_COMPARISONS })
  } catch (error) {
    console.error('Popular comparisons API failed:', error)
    return NextResponse.json({ error: 'Popular comparisons API failed' }, { status: 500 })
  }
}
