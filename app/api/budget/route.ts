import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const amount = parseFloat(searchParams.get('amount') || '15')
    const range = parseFloat(searchParams.get('range') || '0.5')
    
    const minPrice = amount - range
    const maxPrice = amount + range

    const variants = await db.variant.findMany({
      where: {
        prices: {
          some: {
            priceInrLakh: {
              gte: minPrice,
              lte: maxPrice
            },
            isLatest: true
          }
        }
      },
      include: {
        model: { include: { manufacturer: true } },
        prices: { where: { isLatest: true }, take: 1 },
        scores: { include: { category: true } }
      }
    })

    const result = variants.map(v => {
      const overallScore = v.scores.find(s => s.category.name === 'Overall')?.score || 600
      return {
        variantSlug: v.slug,
        variantName: v.name,
        modelName: v.model.name,
        manufacturerName: v.model.manufacturer.name,
        priceInrLakh: v.prices[0]?.priceInrLakh || 0,
        overallScore
      }
    }).sort((a, b) => b.overallScore - a.overallScore)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Budget finder API failed:', error)
    return NextResponse.json({ error: 'Budget finder API failed' }, { status: 500 })
  }
}
