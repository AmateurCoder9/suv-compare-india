import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCarHeroImage, getFallbackCarImage } from '@/lib/images'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slugsParam = searchParams.get('slugs')
    let slugs: string[] = []

    if (slugsParam) {
      slugs = slugsParam.split(',').map(s => s.trim()).filter(Boolean)
    } else {
      const v1 = searchParams.get('v1')
      const v2 = searchParams.get('v2')
      if (v1) slugs.push(v1)
      if (v2) slugs.push(v2)
    }

    if (slugs.length === 0) {
      return NextResponse.json({ error: 'At least one variant slug is required' }, { status: 400 })
    }

    const variants = await db.variant.findMany({
      where: { slug: { in: slugs } },
      include: {
        model: { include: { manufacturer: true } },
        scores: { include: { category: true } },
        features: { include: { feature: { include: { category: true } } } },
        prices: { orderBy: { priceInrLakh: 'asc' }, take: 1 }
      }
    })

    // Sort variants to match the original order in slugs array and add imageUrl
    const orderedVariants = slugs
      .map(slug => {
        const v = variants.find(v => v.slug === slug)
        if (v) {
          return {
            ...v,
            imageUrl: getCarHeroImage(v.model.slug) || getFallbackCarImage(v.model.slug) || ''
          }
        }
        return null
      })
      .filter(Boolean)

    return NextResponse.json({ variants: orderedVariants })
  } catch (error) {
    console.error('Error fetching variants for comparison:', error)
    return NextResponse.json({ error: 'Failed to fetch variants for comparison' }, { status: 500 })
  }
}
