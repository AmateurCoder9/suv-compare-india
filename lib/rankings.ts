import { db } from './db'

export async function getTopVariantsByCategory(categoryName: string, limit: number = 5) {
  const topScores = await db.variantScore.findMany({
    where: {
      category: {
        name: categoryName
      }
    },
    orderBy: {
      score: 'desc'
    },
    take: limit,
    include: {
      variant: {
        include: {
          model: {
            include: {
              manufacturer: true,
              media: true
            }
          },
          prices: {
            orderBy: { priceInrLakh: 'asc' },
            take: 1
          }
        }
      }
    }
  })

  return topScores.map(scoreItem => ({
    ...scoreItem.variant,
    score: scoreItem.score
  }))
}

export async function getAllRankingsCategories() {
  const categories = await db.scoreCategory.findMany({
    select: {
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return categories.map(c => c.name)
}
