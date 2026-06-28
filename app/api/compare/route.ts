import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const v1Slug = searchParams.get('v1')
    const v2Slug = searchParams.get('v2')

    if (!v1Slug || !v2Slug) {
      return NextResponse.json({ error: 'Both v1 and v2 parameters are required' }, { status: 400 })
    }

    const [v1, v2] = await Promise.all([
      db.variant.findUnique({
        where: { slug: v1Slug },
        include: {
          model: { include: { manufacturer: true } },
          scores: { include: { category: true } },
          features: { include: { feature: { include: { category: true } } } },
          prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 }
        }
      }),
      db.variant.findUnique({
        where: { slug: v2Slug },
        include: {
          model: { include: { manufacturer: true } },
          scores: { include: { category: true } },
          features: { include: { feature: { include: { category: true } } } },
          prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 }
        }
      })
    ])

    if (!v1 || !v2) {
      return NextResponse.json({ error: 'One or both variants not found' }, { status: 404 })
    }

    return NextResponse.json({ v1, v2 })
  } catch (error) {
    console.error('Error fetching variants for comparison:', error)
    return NextResponse.json({ error: 'Failed to fetch variants for comparison' }, { status: 500 })
  }
}
