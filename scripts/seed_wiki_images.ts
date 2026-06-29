import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'

const prisma = new PrismaClient()
const PUBLIC_MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

const CAR_IMAGES: Record<string, string> = {
  'kia-seltos': 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg',
  'hyundai-creta': 'https://upload.wikimedia.org/wikipedia/commons/2/25/2022_Hyundai_Creta_1.6_Plus_%28Chile%29_front_view.jpg',
  'hyundai-venue': 'https://upload.wikimedia.org/wikipedia/commons/0/0c/2022_Hyundai_Venue_Preferred_in_Polar_White%2C_Front_Right%2C_09-12-2023.jpg',
  'volkswagen-taigun': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Volkswagen_Taigun_front_20230528.jpg',
  'skoda-kushaq': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/2021_Skoda_Kushaq_Ambition_front_view_%28India%29.png',
  'honda-elevate': 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Honda_WR-V_Z%2B_%285BA-DG5%29_front.jpg',
  'mg-astor': 'https://upload.wikimedia.org/wikipedia/commons/7/77/2020_MG_ZS_Exclusive_1.5_Front.jpg',
  'mg-hector': 'https://upload.wikimedia.org/wikipedia/commons/8/87/2021_MG_Hector_Plus_Sharp_2.0_Turbo_Diesel_%28India%29_front_view.png',
  'citron-basalt': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Citroen_Basalt_Turbo_200_Shine_2025.jpg',
  'citron-c3-aircross': 'https://upload.wikimedia.org/wikipedia/commons/b/be/Citro%C3%ABn_%C3%AB-C3_Aircross_IMG_3525.jpg'
}

async function seedWikiImages() {
  const models = await prisma.model.findMany()

  for (const model of models) {
    const imageUrl = CAR_IMAGES[model.slug]
    if (!imageUrl) {
      console.log(`No image mapped for ${model.slug}`)
      continue
    }

    console.log(`Downloading image for ${model.name}...`)
    
    try {
      const res = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      if (!res.ok) throw new Error(`Failed to fetch ${imageUrl}: ${res.statusText}`)
      
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Process with sharp
      const processedBuffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()

      const outDir = path.join(PUBLIC_MEDIA_DIR, model.slug)
      await fs.mkdir(outDir, { recursive: true })

      // Clean old svgs in the directory
      const files = await fs.readdir(outDir)
      for (const file of files) {
        if (file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg')) {
          await fs.unlink(path.join(outDir, file)).catch(() => {})
        }
      }

      const filename = 'hero.jpg'
      const filepath = path.join(outDir, filename)
      await fs.writeFile(filepath, processedBuffer)

      const sha256 = crypto.createHash('sha256').update(processedBuffer).digest('hex')

      // Delete existing media from DB
      await prisma.media.deleteMany({
        where: { modelId: model.id }
      })

      // Create DB entry
      await prisma.media.create({
        data: {
          imageUrl: `/media/${model.slug}/${filename}`,
          filename: filename,
          mime: 'image/jpeg',
          category: 'Hero',
          sha256: sha256,
          model: { connect: { id: model.id } },
          filesize: processedBuffer.length,
          width: 1200,
          height: 800,
          source: 'Wikimedia Commons',
          isHero: true,
          verificationStatus: 'VERIFIED'
        }
      })
      
      console.log(`Successfully seeded ${model.name}`)
    } catch (e: any) {
      console.error(`Error processing ${model.name}:`, e.message)
    }
  }
  
  console.log('Wiki Seeding complete!')
}

seedWikiImages().catch(console.error).finally(() => prisma.$disconnect())
