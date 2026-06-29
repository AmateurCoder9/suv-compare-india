import { NextRequest, NextResponse } from 'next/server'
import { computeVariantDelta } from '@/lib/variant-delta'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const fromSlug = searchParams.get('from')
    const toSlug = searchParams.get('to')

    if (!fromSlug || !toSlug) {
      return NextResponse.json({ error: 'Both from and to parameters are required' }, { status: 400 })
    }

    const delta = await computeVariantDelta(fromSlug, toSlug)
    if (!delta) {
      return NextResponse.json({ error: 'One or both variants not found' }, { status: 404 })
    }

    return NextResponse.json({ data: delta })
  } catch (error) {
    console.error('Variant delta API failed:', error)
    return NextResponse.json({ error: 'Variant delta API failed' }, { status: 500 })
  }
}
