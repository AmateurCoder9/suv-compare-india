import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fetching variants...')
  const variants = await prisma.variant.findMany()

  const categories = ['Value for Money', 'Tech & Features', 'Safety', 'Overall']

  console.log('Generating dummy scores for demonstration...')
  for (const variant of variants) {
    for (const category of categories) {
      // Create random score if not exists
      const score = Math.floor(Math.random() * 500) + 500 // 500 to 1000

      // In Prisma 5, score might be stored in VariantScore or ScoreCategory first?
      // Wait, VariantScore requires categoryId (a relation to ScoreCategory)!
      // Let's create ScoreCategory first
      
      const scoreCat = await prisma.scoreCategory.upsert({
        where: { name: category },
        update: {},
        create: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          maxScore: 1000,
          weight: 1.0,
        }
      })

      await prisma.variantScore.upsert({
        where: {
          variantId_categoryId: {
            variantId: variant.id,
            categoryId: scoreCat.id
          }
        },
        update: {},
        create: {
          variantId: variant.id,
          categoryId: scoreCat.id,
          score: score,
          explanation: `Automated score generated for ${category}.`,
          confidence: 90
        }
      })
    }
  }

  console.log('Recomputing Rankings...')
  
  for (const category of categories) {
    const scoreCat = await prisma.scoreCategory.findUnique({ where: { name: category }})
    if (!scoreCat) continue

    const topScores = await prisma.variantScore.findMany({
      where: { categoryId: scoreCat.id },
      orderBy: { score: 'desc' }
    })

    let currentRank = 1
    for (const s of topScores) {
      await prisma.ranking.upsert({
        where: {
          category_variantId: {
            category: category,
            variantId: s.variantId
          }
        },
        update: {
          rank: currentRank,
          score: s.score
        },
        create: {
          variantId: s.variantId,
          category: category,
          rank: currentRank,
          score: s.score
        }
      })
      currentRank++
    }
  }

  console.log('Rankings recomputed successfully.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
