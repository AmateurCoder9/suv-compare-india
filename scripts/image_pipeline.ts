import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { chromium } from 'playwright'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

const PUBLIC_MEDIA_DIR = path.join(process.cwd(), 'public', 'media')
const MIN_WIDTH = 200
const MIN_HEIGHT = 150

// Categories from the spec
const CATEGORIES = [
  'Hero', 'Front', 'Front 3/4', 'Front Close-up', 'Rear', 'Rear 3/4', 'Rear Close-up',
  'Side', 'Top', 'Dashboard', 'Steering Wheel', 'Instrument Cluster', 'Infotainment',
  'Front Seats', 'Rear Seats', 'Door Panel', 'Centre Console', 'Gear Lever', 'Sunroof',
  'Panoramic Roof', 'Boot', 'Engine Bay', 'Wheel', 'Headlight', 'Tail Light',
  'Colour Option', 'Press Photo', 'Lifestyle', 'Unknown'
]

async function ensureDir(dir: string) {
  try { await fs.mkdir(dir, { recursive: true }) } catch (e) {}
}

function getSha256(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

// Simple heuristic classifier
function classifyImage(filename: string, alt: string, url: string): string {
  const text = `${filename} ${alt} ${url}`.toLowerCase()
  
  if (text.includes('dashboard') || text.includes('dash')) return 'Dashboard'
  if (text.includes('interior') || text.includes('cabin')) return 'Dashboard' // General interior fallback
  if (text.includes('wheel') || text.includes('alloy')) return 'Wheel'
  if (text.includes('boot') || text.includes('trunk')) return 'Boot'
  if (text.includes('seat')) return 'Front Seats'
  if (text.includes('rear') && text.includes('3/4')) return 'Rear 3/4'
  if (text.includes('front') && text.includes('3/4')) return 'Front 3/4'
  if (text.includes('side')) return 'Side'
  if (text.includes('rear') || text.includes('back')) return 'Rear'
  if (text.includes('front')) return 'Front'
  if (text.includes('headlight') || text.includes('headlamp')) return 'Headlight'
  
  return 'Unknown'
}

async function extractUrlsLightweight(query: string): Promise<string[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    const html = await res.text()
    const $ = cheerio.load(html)
    const urls: string[] = []
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src && src.startsWith('http')) urls.push(src)
    })
    return urls
  } catch (e) {
    return []
  }
}

async function extractUrlsPlaywright(query: string): Promise<string[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`)
  
  // Wait for images to load
  await page.waitForTimeout(3000)
  
  const urls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map(img => img.src)
      .filter(src => src && src.startsWith('http'))
  })
  
  await browser.close()
  return urls
}

async function downloadAndProcessImage(url: string, model: any, outDir: string, globalHashes: Set<string>) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return false
    
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Hash check
    const hash = getSha256(buffer)
    if (globalHashes.has(hash)) return false // Duplicate across run
    
    // Check DB for hash
    const existing = await prisma.media.findUnique({ where: { sha256: hash } })
    if (existing) return false // Already in DB
    
    // Validate image size & process with Sharp
    const metadata = await sharp(buffer).metadata()
    if (!metadata.width || !metadata.height || metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
      return false // Too small, likely thumbnail
    }
    
    const ext = metadata.format === 'jpeg' ? 'jpg' : (metadata.format || 'jpg')
    const filename = `${hash.substring(0, 12)}.${ext}`
    const filepath = path.join(outDir, filename)
    
    await fs.writeFile(filepath, buffer)
    
    // Create optimized versions if requested (skipped for brevity here, assuming raw save for DB)
    // Generating a blurhash placeholder (small base64 image)
    const blurBuffer = await sharp(buffer).resize(10, 10, { fit: 'inside' }).blur().toBuffer()
    const blurhash = `data:image/${ext};base64,${blurBuffer.toString('base64')}`
    
    // Categorize
    const category = classifyImage(filename, '', url)
    
    // Save to DB
    await prisma.media.create({
      data: {
        modelId: model.id,
        category: category,
        filename: filename,
        width: metadata.width,
        height: metadata.height,
        filesize: buffer.length,
        mime: `image/${metadata.format}`,
        sha256: hash,
        imageUrl: `/media/${model.slug}/${filename}`,
        sourcePage: new URL(url).hostname,
      }
    })
    
    globalHashes.add(hash)
    return true
  } catch (e) {
    return false
  }
}

async function main() {
  console.log('Starting Visual Asset Pipeline...')
  await ensureDir(PUBLIC_MEDIA_DIR)
  
  const models = await prisma.model.findMany({ include: { manufacturer: true } })
  const globalHashes = new Set<string>()
  
  for (const model of models) {
    console.log(`\nProcessing ${model.manufacturer.name} ${model.name}...`)
    const modelDir = path.join(PUBLIC_MEDIA_DIR, model.slug)
    await ensureDir(modelDir)
    
    const queries = [
      `${model.manufacturer.name} ${model.name} official press image high resolution`,
      `${model.manufacturer.name} ${model.name} interior dashboard image`,
      `${model.manufacturer.name} ${model.name} front side view`
    ]
    
    let totalDownloaded = 0
    for (const query of queries) {
      if (totalDownloaded >= 10) break // limit per model for demo
      
      console.log(`Searching: ${query}`)
      let urls = await extractUrlsLightweight(query)
      
      if (urls.length < 5) {
        console.log(`Lightweight extraction found few images, escalating to Playwright...`)
        try {
          urls = await extractUrlsPlaywright(query)
        } catch(e) {
          console.log('Playwright escalation failed, skipping.')
        }
      }
      
      // Deduplicate URLs
      urls = Array.from(new Set(urls))
      
      for (const url of urls) {
        if (totalDownloaded >= 10) break
        const success = await downloadAndProcessImage(url, model, modelDir, globalHashes)
        if (success) {
          totalDownloaded++
          process.stdout.write('.')
        }
      }
    }
    
    // Post-process to select a Hero image if none exists
    const mediaCount = await prisma.media.count({ where: { modelId: model.id } })
    if (mediaCount > 0) {
      const hero = await prisma.media.findFirst({ where: { modelId: model.id, isHero: true } })
      if (!hero) {
        // Fallback: pick the first one that has landscape orientation and is large
        const candidate = await prisma.media.findFirst({
          where: { modelId: model.id, category: { in: ['Front 3/4', 'Front', 'Side', 'Unknown'] } },
          orderBy: { width: 'desc' }
        })
        if (candidate) {
          await prisma.media.update({ where: { id: candidate.id }, data: { isHero: true, category: 'Hero' } })
          console.log(`\nSelected Hero image for ${model.name}`)
        }
      }
    }
  }
  
  console.log('\nPipeline Complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
