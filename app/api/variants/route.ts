import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const variants = await db.variant.findMany({
      include: {
        model: {
          include: {
            manufacturer: true
          }
        },
        scores: { include: { category: true } },
        prices: {
          orderBy: { priceInrLakh: 'asc' },
          take: 1
        }
      }
    })

    // Sort in JS instead
    variants.sort((a, b) => {
      const priceA = a.prices[0]?.priceInrLakh || 0
      const priceB = b.prices[0]?.priceInrLakh || 0
      return priceA - priceB
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 })
  }
}
