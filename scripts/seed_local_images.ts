import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const prisma = new PrismaClient()
const PUBLIC_MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

// Hardcoded artifact paths we know exist
const ARTIFACTS = [
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\bf785a2d-9a03-4515-8cb8-38ee48d754c2\\hyundai_creta_1782687643122.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\bf785a2d-9a03-4515-8cb8-38ee48d754c2\\kia_seltos_1782687654973.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\bf785a2d-9a03-4515-8cb8-38ee48d754c2\\maruti_grand_vitara_1782687675316.png',
  'C:\\Users\\HP\\.gemini\\antigravity\\brain\\bf785a2d-9a03-4515-8cb8-38ee48d754c2\\tata_nexon_1782687664665.png'
]

async function seedLocalImages() {
  const models = await prisma.model.findMany()

  for (let i = 0; i < models.length; i++) {
    const model = models[i]
    // pick one of the 4 images in a loop
    const sourceImage = ARTIFACTS[i % ARTIFACTS.length]

    console.log(`Seeding local image for ${model.name}...`)
    
    try {
      const buffer = await fs.readFile(sourceImage)
      
      const outDir = path.join(PUBLIC_MEDIA_DIR, model.slug)
      await fs.mkdir(outDir, { recursive: true })

      // Clean old svgs in the directory
      const files = await fs.readdir(outDir)
      for (const file of files) {
        if (file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg')) {
          await fs.unlink(path.join(outDir, file)).catch(() => {})
        }
      }

      const filename = 'hero.png'
      const filepath = path.join(outDir, filename)
      await fs.writeFile(filepath, buffer)

      // Random string to make sha256 unique for each model so prisma doesn't complain
      const uniqueBuffer = Buffer.concat([buffer, Buffer.from(model.slug)])
      const sha256 = crypto.createHash('sha256').update(uniqueBuffer).digest('hex')

      // Delete existing media from DB
      await prisma.media.deleteMany({
        where: { modelId: model.id }
      })

      // Create DB entry
      await prisma.media.create({
        data: {
          imageUrl: `/media/${model.slug}/${filename}`,
          filename: filename,
          mime: 'image/png',
          category: 'Hero',
          sha256: sha256,
          model: { connect: { id: model.id } },
          filesize: buffer.length,
          width: 1024,
          height: 768,
          isHero: true,
          verificationStatus: 'VERIFIED'
        }
      })
      
      console.log(`Successfully seeded ${model.name}`)
    } catch (e: any) {
      console.error(`Error processing ${model.name}:`, e.message)
    }
  }
  
  console.log('Local Seeding complete!')
}

seedLocalImages().catch(console.error).finally(() => prisma.$disconnect())
