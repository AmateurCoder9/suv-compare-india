import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const variant = await db.variant.findUnique({
      where: { slug },
      include: {
        model: {
          include: {
            manufacturer: true
          }
        },
        scores: { include: { category: true } },
        features: {
          include: {
            feature: {
              include: {
                category: true
              }
            }
          }
        },
        prices: {
          orderBy: { priceInrLakh: 'asc' },
          take: 1
        }
      }
    })

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
    }

    return NextResponse.json(variant)
  } catch (error) {
    console.error('Error fetching variant:', error)
    return NextResponse.json({ error: 'Failed to fetch variant details' }, { status: 500 })
  }
}
