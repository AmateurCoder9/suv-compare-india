import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const catName = searchParams.get('scoreCategory') || 'Overall'

    const variants = await db.variant.findMany({
      include: {
        model: { include: { manufacturer: true } },
        prices: { where: { isLatest: true }, take: 1 },
        scores: { include: { category: true } }
      }
    })

    const data = variants.map(v => {
      const scoreObj = v.scores.find(s => s.category.name.toLowerCase() === catName.toLowerCase()) || 
                       v.scores.find(s => s.category.name === 'Overall')
      const score = scoreObj ? scoreObj.score : 600
      
      return {
        slug: v.slug,
        variantName: v.name,
        modelName: v.model.name,
        manufacturerName: v.model.manufacturer.name,
        priceInrLakh: v.prices[0]?.priceInrLakh || 0,
        score
      }
    }).filter(item => item.priceInrLakh > 0)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Scatter plot API failed:', error)
    return NextResponse.json({ error: 'Scatter plot API failed' }, { status: 500 })
  }
}
