import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { performSearch } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    // Fetch all variants with their models and manufacturers
    const variants = await db.variant.findMany({
      include: {
        model: {
          include: {
            manufacturer: true
          }
        }
      }
    })

    // Prepare data for Fuse.js
    const searchableData = variants.map(variant => ({
      id: variant.id,
      slug: variant.slug,
      name: variant.name,
      model: variant.model.name,
      manufacturer: variant.model.manufacturer.name,
      fullName: `${variant.model.manufacturer.name} ${variant.model.name} ${variant.name}`,
      bodyType: variant.model.bodyType,
    }))

    const results = performSearch(query, searchableData)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in search:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
