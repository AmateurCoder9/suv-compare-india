import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const prisma = new PrismaClient()
const PUBLIC_MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

async function seedImages() {
  const models = await prisma.model.findMany()

  for (const model of models) {
    console.log(`Seeding image for ${model.name}...`)

    const placeholderSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a" />
      <text x="50%" y="50%" font-family="sans-serif" font-size="40" font-weight="bold" fill="#444" text-anchor="middle" dominant-baseline="middle">
        ${model.name}
      </text>
    </svg>`
    
    const outDir = path.join(PUBLIC_MEDIA_DIR, model.slug)
    await fs.mkdir(outDir, { recursive: true })

    const filename = 'hero-placeholder.svg'
    const filepath = path.join(outDir, filename)
    await fs.writeFile(filepath, placeholderSvg)

    const fileBuffer = Buffer.from(placeholderSvg)
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    // Delete existing media to prevent duplicates
    await prisma.media.deleteMany({
      where: { modelId: model.id }
    })

    // Create DB entry
    await prisma.media.create({
      data: {
        imageUrl: `/media/${model.slug}/${filename}`,
        filename: filename,
        mime: 'image/svg+xml',
        category: 'Hero',
        sha256: sha256,
        model: { connect: { id: model.id } },
        filesize: fileBuffer.length,
        width: 800,
        height: 600
      }
    })
  }
  
  console.log('Seeding complete!')
}

seedImages().catch(console.error).finally(() => prisma.$disconnect())
